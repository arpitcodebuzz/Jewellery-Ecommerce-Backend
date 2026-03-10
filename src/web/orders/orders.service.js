import db from "../../common/config/db.js";
import razorpay from "../../common/config/razorpay.js";

function round2(value) {
  return Number(Number(value || 0).toFixed(2));
}

function normalizeState(value) {
  return String(value || "").trim().toLowerCase();
}

async function generateOrderNumber() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD${yyyy}${mm}${dd}${random}`;
}

async function getLatestMetalRate(trx, metalType, purityCode) {
  return trx("metal_rates")
    .where({
      metal_type: metalType,
      purity_code: purityCode,
    })
    .orderBy("effective_from", "desc")
    .first();
}

async function getLatestStoneRate(trx, stone) {
  const query = trx("stone_rates").where({
    stone_type: stone.stone_type,
  });

  if (stone.clarity_grade !== null && stone.clarity_grade !== undefined) {
    query.andWhere("clarity_grade", stone.clarity_grade);
  } else {
    query.whereNull("clarity_grade");
  }

  if (stone.color_grade !== null && stone.color_grade !== undefined) {
    query.andWhere("color_grade", stone.color_grade);
  } else {
    query.whereNull("color_grade");
  }

  if (stone.cut_grade !== null && stone.cut_grade !== undefined) {
    query.andWhere("cut_grade", stone.cut_grade);
  } else {
    query.whereNull("cut_grade");
  }

  return query.orderBy("effective_from", "desc").first();
}

async function calculateProductLivePrice(trx, productId, shippingState) {
  const product = await trx("products").where({ id: productId }).first();

  if (!product) {
    throw new Error(`Product not found for ID ${productId}`);
  }

  const metals = await trx("product_metal_components").where({
    product_id: productId,
  });

  const stones = await trx("product_stone_components").where({
    product_id: productId,
  });

  let metalCost = 0;
  let totalMetalWeight = 0;

  for (const metal of metals) {
    const rateRow = await getLatestMetalRate(
      trx,
      metal.metal_type,
      metal.purity_code
    );

    if (!rateRow) {
      throw new Error(
        `Metal rate not found for ${metal.metal_type} ${metal.purity_code}`
      );
    }

    const weight = Number(metal.weight_grams || 0);
    const rate = Number(rateRow.rate_per_gram || 0);

    metalCost += weight * rate;
    totalMetalWeight += weight;
  }

  let stoneCost = 0;

  for (const stone of stones) {
    const rateRow = await getLatestStoneRate(trx, stone);

    if (!rateRow) {
      throw new Error(
        `Stone rate not found for ${stone.stone_type} / ${stone.clarity_grade || "NA"
        } / ${stone.color_grade || "NA"} / ${stone.cut_grade || "NA"}`
      );
    }

    const weightCarat = Number(stone.weight_carat || 0);
    const rate = Number(rateRow.rate_per_carat || 0);

    stoneCost += weightCarat * rate;
  }

  const makingChargeValue = Number(product.making_charge_value || 0);
  let makingCharge = 0;

  if (product.making_charge_type === "per_gram") {
    makingCharge = totalMetalWeight * makingChargeValue;
  } else {
    makingCharge = makingChargeValue;
  }

  const wastageAmount =
    metalCost * (Number(product.wastage_percent || 0) / 100);

  const subtotalBeforeMargin =
    metalCost + stoneCost + makingCharge + wastageAmount;

  const marginAmount =
    subtotalBeforeMargin * (Number(product.margin_percent || 0) / 100);

  const taxableAmount = subtotalBeforeMargin + marginAmount;

  const gstPercent = Number(product.gst_percent || 3);

  const storeState = "gujarat";
  const customerState = normalizeState(shippingState);

  let gstType = "igst";
  if (customerState === storeState) {
    gstType = "cgst_sgst";
  }

  const gstAmount = taxableAmount * (gstPercent / 100);
  const unitPrice = taxableAmount + gstAmount;

  return {
    product,
    gst_type: gstType,
    unit_price: round2(unitPrice),
    taxable_amount: round2(taxableAmount),
    metal_cost: round2(metalCost),
    stone_cost: round2(stoneCost),
    making_charge: round2(makingCharge),
    wastage_amount: round2(wastageAmount),
    margin_amount: round2(marginAmount),
    gst_amount: round2(gstAmount),
    gst_percent: round2(gstPercent),
  };
}

export const checkOutOrderService = async (userId, payload) => {
  const trx = await db.transaction();

  try {
    const cart = await trx("carts")
      .where({ user_id: userId, status: "active" })
      .first();

    if (!cart) {
      await trx.rollback();
      return {
        status: false,
        statusCode: 404,
        message: "Cart not found",
        data: null,
      };
    }

    const cartItems = await trx("cart_items").where({ cart_id: cart.id });

    if (!cartItems.length) {
      await trx.rollback();
      return {
        status: false,
        statusCode: 404,
        message: "Cart items not found",
        data: null,
      };
    }

    const calculatedItems = [];
    let subtotalAmount = 0;
    let totalGstAmount = 0;
    let totalAmount = 0;
    let finalGstType = "igst";

    for (const item of cartItems) {
      const quantity = Number(item.quantity || 1);

      const livePrice = await calculateProductLivePrice(
        trx,
        item.product_id,
        payload.shipping_state
      );

      const lineSubtotal = round2(livePrice.taxable_amount * quantity);
      const lineGst = round2(livePrice.gst_amount * quantity);
      const lineTotal = round2(lineSubtotal + lineGst);

      subtotalAmount += lineSubtotal;
      totalGstAmount += lineGst;
      totalAmount += lineTotal;

      finalGstType = livePrice.gst_type;

      calculatedItems.push({
        product_id: item.product_id,
        quantity,
        product_name: livePrice.product.name,
        product_sku: livePrice.product.sku,
        unit_price: livePrice.unit_price,
        total_price: lineTotal,
        metal_cost: round2(livePrice.metal_cost * quantity),
        stone_cost: round2(livePrice.stone_cost * quantity),
        making_charge: round2(livePrice.making_charge * quantity),
        wastage_amount: round2(livePrice.wastage_amount * quantity),
        margin_amount: round2(livePrice.margin_amount * quantity),
        gst_amount: lineGst,
        gst_percent: livePrice.gst_percent,
      });
    }

    subtotalAmount = round2(subtotalAmount);
    totalGstAmount = round2(totalGstAmount);
    totalAmount = round2(totalAmount);

    let orderNumber;
    let existingOrder;

    do {
      orderNumber = await generateOrderNumber();
      existingOrder = await trx("orders")
        .where({ order_number: orderNumber })
        .first();
    } while (existingOrder);

    const orderPayload = {
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

      gst_type: finalGstType,
      notes: payload.notes || null,
    };

    const [orderId] = await trx("orders").insert(orderPayload);

    const orderItemsPayload = calculatedItems.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      product_name: item.product_name,
      product_sku: item.product_sku,
      unit_price: item.unit_price,
      total_price: item.total_price,
      metal_cost: item.metal_cost,
      stone_cost: item.stone_cost,
      making_charge: item.making_charge,
      wastage_amount: item.wastage_amount,
      margin_amount: item.margin_amount,
      gst_amount: item.gst_amount,
      gst_percent: item.gst_percent,
    }));

    await trx("order_items").insert(orderItemsPayload);

    await trx("payments").insert({
      order_id: orderId,
      payment_gateway: "razorpay",
      payment_method: null,
      amount: totalAmount,
      status: "pending",
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(totalAmount) * 100), // paise
      currency: "INR",
      receipt: orderNumber,
      notes: {
        local_order_id: String(orderId),
        local_order_number: orderNumber,
        user_id: String(userId),
      },
    });


    await trx("payments")
      .where({ order_id: orderId })
      .update({
        gateway_order_id: razorpayOrder.id,
        gateway_response: JSON.stringify(razorpayOrder),
        updated_at: trx.fn.now(),
      });


    await trx("carts").where({ id: cart.id }).update({
      status: "converted",
      updated_at: trx.fn.now(),
    });

    await trx.commit();

    const createdOrder = await db("orders").where({ id: orderId }).first();
    const createdItems = await db("order_items").where({ order_id: orderId });
    const payment = await db("payments").where({ order_id: orderId }).first();


    return {
      status: true,
      statusCode: 200,
      message: "Order created successfully",
      data: {
        orderId,
        orderNumber,
        amount: totalAmount,
        currency: "INR",
        razorpayOrderId: razorpayOrder.id,
        key: process.env.RAZORPAY_KEY_ID,
        customer: {
          name: payload.shipping_name,
          email: payload.shipping_email || "",
          contact: payload.shipping_phone || "",
        },
      },
    };
  } catch (error) {
    await trx.rollback();
    return {
      status: false,
      statusCode: 400,
      message: error.message,
      data: null,
    };
  }
};


export async function getMyOrdersService(userId) {
  if (!userId) {
    return {
      status: false,
      statusCode: 401,
      message: "Unauthorized",
    };
  }

  const orders = await db("orders")
    .where({ user_id: userId })
    .orderBy("id", "desc");

  if (orders.length === 0) {
    return {
      status: true,
      statusCode: 200,
      message: "No orders found",
      data: [],
    };
  }

  return {
    status: true,
    statusCode: 200,
    message: "Orders fetched successfully",
    data: orders,
  };
}


export const getOrderByIdService = async (orderId) => {
  const order = await db("orders").where({ id: orderId }).first();

  if (!order) {
    return { status: false, statusCode: 404, message: "Order not found" };
  }
  const item = await db("order_items").where({ order_id: orderId }).orderBy("id", "asc");
  const payment = await db("payments").where({ order_id: orderId }).first();

  return { status: true, statusCode: 200, data: { order, items: item, payment } };
};



export const cancelOrderService = async (orderId) => {
  const order = await db("orders").where({ id: orderId }).first();

  if (!order) {
    return { status: false, statusCode: 404, message: "Order not found" };
  }


  if (order.status === " canceled") {
    return { status: false, statusCode: 400, message: "Order already canceled" };
  }

  if (order.status === "shipped") {
    return { status: false, statusCode: 400, message: "Order cannot be canceled as it has already been shipped" };
  }

  if (order.status === "delivered") {
    return { status: false, statusCode: 400, message: "Order cannot be canceled as it has already been delivered" };
  }

  if (order.status === "processing") {
    return { status: false, statusCode: 400, message: "Order cannot be canceled as it has already been processed" };
  }

  if (order.status === "completed") {
    return { status: false, statusCode: 400, message: "Order cannot be canceled as it has already been completed" };
  }

  if (order.status === "failed") {
    return { status: false, statusCode: 400, message: "Order cannot be canceled as it has already been failed" };
  }


  await db("orders").where({ id: orderId }).update({ status: "canceled" });
  return { status: true, statusCode: 200, message: "Order canceled successfully" };

}