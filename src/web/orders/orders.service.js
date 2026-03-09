import db from "../../common/config/db.js";

const STORE_STATE = (process.env.STORE_STATE || "Gujarat").trim().toLowerCase();

function round2(value) {
  return Number(Number(value || 0).toFixed(2));
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function buildOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `ORD${y}${m}${d}${rand}`;
}

async function getLatestMetalRate(trx, metal_type, purity_code) {
  return trx("metal_rates")
    .where({ metal_type, purity_code })
    .orderBy("effective_from", "desc")
    .orderBy("id", "desc")
    .first();
}

async function getLatestStoneRate(
  trx,
  stone_type,
  clarity_grade,
  color_grade,
  cut_grade
) {
  const exact = await trx("stone_rates")
    .where({
      stone_type,
      clarity_grade: clarity_grade ?? null,
      color_grade: color_grade ?? null,
      cut_grade: cut_grade ?? null,
      status: "active",
    })
    .orderBy("effective_from", "desc")
    .orderBy("id", "desc")
    .first();

  if (exact) return exact;

  const fallback = await trx("stone_rates")
    .where({ stone_type, status: "active" })
    .andWhere((qb) => {
      qb.whereNull("clarity_grade").orWhere("clarity_grade", clarity_grade ?? null);
    })
    .andWhere((qb) => {
      qb.whereNull("color_grade").orWhere("color_grade", color_grade ?? null);
    })
    .andWhere((qb) => {
      qb.whereNull("cut_grade").orWhere("cut_grade", cut_grade ?? null);
    })
    .orderBy("effective_from", "desc")
    .orderBy("id", "desc")
    .first();

  return fallback || null;
}

async function calculateProductLivePrice(trx, productId, shippingState) {
  const product = await trx("products")
    .select(
      "id",
      "name",
      "sku",
      "making_charge_type",
      "making_charge_value",
      "wastage_percent",
      "margin_percent",
      "gst_percent",
      "status"
    )
    .where({ id: productId })
    .first();

  if (!product) {
   return { status: false, statusCode: 404, message: "Product not found" };
  }

  if (product.status !== "active") {
   return { status: false, statusCode: 400, message: "Product is not active" };
  }

  const metalComponents = await trx("product_metal_components")
    .select("metal_type", "purity_code", "weight_grams")
    .where({ product_id: productId });

  const stoneComponents = await trx("product_stone_components")
    .select(
      "stone_type",
      "clarity_grade",
      "color_grade",
      "cut_grade",
      "weight_carat",
      "piece_count"
    )
    .where({ product_id: productId });

  let totalMetalWeight = 0;
  let metalCost = 0;

  for (const metal of metalComponents) {
    const latestRate = await getLatestMetalRate(
      trx,
      metal.metal_type,
      metal.purity_code
    );

    if (!latestRate) {
     return { status: false, statusCode: 400, message: "Latest metal rate not found" };
    }

    const weight = Number(metal.weight_grams || 0);
    const rate = Number(latestRate.rate_per_gram || 0);

    totalMetalWeight += weight;
    metalCost += weight * rate;
  }

  let stoneCost = 0;

  for (const stone of stoneComponents) {
    const latestRate = await getLatestStoneRate(
      trx,
      stone.stone_type,
      stone.clarity_grade,
      stone.color_grade,
      stone.cut_grade
    );

    if (!latestRate) {
     return { status: false, statusCode: 400, message: "Latest stone rate not found" };
    }

    const carat = Number(stone.weight_carat || 0);
    const rate = Number(latestRate.rate_per_carat || 0);

    stoneCost += carat * rate;
  }

  const makingCharge =
    product.making_charge_type === "per_gram"
      ? totalMetalWeight * Number(product.making_charge_value || 0)
      : Number(product.making_charge_value || 0);

  const wastageAmount =
    metalCost * (Number(product.wastage_percent || 0) / 100);

  const subtotalBeforeMargin = metalCost + stoneCost + makingCharge + wastageAmount;
  const marginAmount =
    subtotalBeforeMargin * (Number(product.margin_percent || 0) / 100);

  const taxableAmount = subtotalBeforeMargin + marginAmount;
  const gstPercent = Number(product.gst_percent || 3);

  const gstType =
    normalizeText(shippingState) === STORE_STATE ? "cgst_sgst" : "igst";

  const gstAmount = taxableAmount * (gstPercent / 100);
  const unitPrice = taxableAmount + gstAmount;

  return {
    product_id: product.id,
    product_name: product.name,
    product_sku: product.sku,
    metal_cost: round2(metalCost),
    stone_cost: round2(stoneCost),
    making_charge: round2(makingCharge),
    wastage_amount: round2(wastageAmount),
    margin_amount: round2(marginAmount),
    gst_amount: round2(gstAmount),
    gst_percent: round2(gstPercent),
    gst_type: gstType,
    unit_price: round2(unitPrice),
  };
}

export async function checkoutOrder(userId, payload) {
  return db.transaction(async (trx) => {
    const cart = await trx("carts")
      .where({ user_id: userId, status: "active" })
      .orderBy("id", "desc")
      .first();

    if (!cart) {
      return {
        status: false,
        statusCode: 404,
        message: "Active cart not found",
      };
    }

    const cartItems = await trx("cart_items")
      .select("id", "cart_id", "product_id", "quantity")
      .where({ cart_id: cart.id });

    if (!cartItems.length) {
      return {
        status: false,
        statusCode: 400,
        message: "Cart is empty",
      };
    }

    const orderItemsPayload = [];
    let subtotalAmount = 0;
    let totalGstAmount = 0;
    let totalAmount = 0;
    let commonGstType = null;

    for (const item of cartItems) {
      const pricing = await calculateProductLivePrice(
        trx,
        item.product_id,
        payload.shipping_state
      );

      const quantity = Number(item.quantity || 1);

      const totalPrice = round2(pricing.unit_price * quantity);
      const totalMetalCost = round2(pricing.metal_cost * quantity);
      const totalStoneCost = round2(pricing.stone_cost * quantity);
      const totalMakingCharge = round2(pricing.making_charge * quantity);
      const totalWastageAmount = round2(pricing.wastage_amount * quantity);
      const totalMarginAmount = round2(pricing.margin_amount * quantity);
      const totalItemGstAmount = round2(pricing.gst_amount * quantity);

      subtotalAmount +=
        totalMetalCost +
        totalStoneCost +
        totalMakingCharge +
        totalWastageAmount +
        totalMarginAmount;

      totalGstAmount += totalItemGstAmount;
      totalAmount += totalPrice;

      commonGstType = pricing.gst_type;

      orderItemsPayload.push({
        product_id: pricing.product_id,
        quantity,
        product_name: pricing.product_name,
        product_sku: pricing.product_sku,
        unit_price: pricing.unit_price,
        total_price: totalPrice,
        metal_cost: totalMetalCost,
        stone_cost: totalStoneCost,
        making_charge: totalMakingCharge,
        wastage_amount: totalWastageAmount,
        margin_amount: totalMarginAmount,
        gst_amount: totalItemGstAmount,
        gst_percent: pricing.gst_percent,
      });
    }

    subtotalAmount = round2(subtotalAmount);
    totalGstAmount = round2(totalGstAmount);
    totalAmount = round2(totalAmount);

    let orderNumber = buildOrderNumber();
    let exists = await trx("orders").where({ order_number: orderNumber }).first();

    while (exists) {
      orderNumber = buildOrderNumber();
      exists = await trx("orders").where({ order_number: orderNumber }).first();
    }

    const [orderId] = await trx("orders").insert({
      user_id: userId,
      order_number: orderNumber,
      status: "pending",
      subtotal_amount: subtotalAmount,
      total_gst_amount: totalGstAmount,
      total_amount: totalAmount,
      shipping_name: payload.shipping_name,
      shipping_email: payload.shipping_email || null,
      shipping_phone: payload.shipping_phone || null,
      shipping_address_line1: payload.shipping_address_line1,
      shipping_address_line2: payload.shipping_address_line2 || null,
      shipping_city: payload.shipping_city,
      shipping_state: payload.shipping_state,
      shipping_postal_code: payload.shipping_postal_code,
      shipping_country: payload.shipping_country || "India",
      gst_type: commonGstType || "igst",
      notes: payload.notes || null,
    });

    const preparedOrderItems = orderItemsPayload.map((item) => ({
      order_id: orderId,
      ...item,
    }));

    await trx("order_items").insert(preparedOrderItems);

    const [paymentId] = await trx("payments").insert({
      order_id: orderId,
      payment_gateway: payload.payment_gateway || "razorpay",
      payment_method: payload.payment_method || "unknown",
      amount: totalAmount,
      status: "pending",
    });

    await trx("carts")
      .where({ id: cart.id })
      .update({
        status: "converted",
        updated_at: trx.fn.now(),
      });

    const createdOrder = await trx("orders").where({ id: orderId }).first();
    const createdOrderItems = await trx("order_items")
      .where({ order_id: orderId })
      .orderBy("id", "asc");
    const createdPayment = await trx("payments").where({ id: paymentId }).first();

    return {
      status: true,
      statusCode: 201,
      message: "Order placed successfully",
      data: {
        order: createdOrder,
        items: createdOrderItems,
        payment: createdPayment,
      },
    };
  });
}

export async function getMyOrders(userId) {
  const rows = await db("orders")
    .select(
      "id",
      "order_number",
      "status",
      "subtotal_amount",
      "total_gst_amount",
      "total_amount",
      "shipping_name",
      "shipping_state",
      "created_at"
    )
    .where({ user_id: userId })
    .orderBy("id", "desc");

  return {
    status: true,
    statusCode: 200,
    message: "Orders fetched successfully",
    data: rows,
  };
}

export async function getMyOrderById(userId, orderId) {
  const order = await db("orders")
    .where({ id: orderId, user_id: userId })
    .first();

  if (!order) {
    return {
      status: false,
      statusCode: 404,
      message: "Order not found",
    };
  }

  const items = await db("order_items")
    .where({ order_id: order.id })
    .orderBy("id", "asc");

  const payment = await db("payments")
    .where({ order_id: order.id })
    .orderBy("id", "desc")
    .first();

  return {
    status: true,
    statusCode: 200,
    message: "Order details fetched successfully",
    data: {
      order,
      items,
      payment,
    },
  };
}

export async function getAllOrdersForAdmin() {
  const rows = await db("orders")
    .select(
      "id",
      "user_id",
      "order_number",
      "status",
      "subtotal_amount",
      "total_gst_amount",
      "total_amount",
      "shipping_name",
      "shipping_state",
      "created_at"
    )
    .orderBy("id", "desc");

  return {
    status: true,
    statusCode: 200,
    message: "All orders fetched successfully",
    data: rows,
  };
}

export async function updateOrderStatus(orderId, status) {
  const existing = await db("orders").where({ id: orderId }).first();

  if (!existing) {
    return {
      status: false,
      statusCode: 404,
      message: "Order not found",
    };
  }

  await db("orders").where({ id: orderId }).update({
    status,
    updated_at: db.fn.now(),
  });

  const updated = await db("orders").where({ id: orderId }).first();

  return {
    status: true,
    statusCode: 200,
    message: "Order status updated successfully",
    data: updated,
  };
}