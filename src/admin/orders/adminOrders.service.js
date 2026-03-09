import db from "../../common/config/db.js";

const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "failed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped"],
  shipped: ["delivered"],
  // Final states: delivered, cancelled, failed (no transitions allowed)
};

export const getAllOrdersService = async (filters) => {
  const {
    page = 1,
    limit = 10,
    status,
    order_number,
    user_id,
    date_from,
    date_to,
  } = filters; 

  const query = db("orders").select("*");

  if (status) query.where("status", status);
  if (order_number) query.where("order_number", "like", `%${order_number}%`);
  if (user_id) query.where("user_id", user_id);
  if (date_from) query.where("created_at", ">=", date_from);
  if (date_to) query.where("created_at", "<=", date_to);

  const totalCountRow = await query.clone().count({ total: "*" }).first();
  const totalCount = Number(totalCountRow?.total || 0);

  const orders = await query
    .orderBy("created_at", "desc")
    .limit(limit)
    .offset((page - 1) * limit);

  return {
    status: true,
    statusCode: 200,
    message: "Orders fetched successfully",
    data: {
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    },
  };
};

export const getOrderByIdService = async (orderId) => {
  const order = await db("orders").where({ id: orderId }).first();

  if (!order) {
    return {
      status: false,
      statusCode: 404,
      message: "Order not found",
    };
  }

  const orderItems = await db("order_items").where({ order_id: orderId });
  const payment = await db("payments").where({ order_id: orderId }).first();

  return {
    status: true,
    statusCode: 200,
    message: "Order details fetched successfully",
    data: {
      order,
      order_items: orderItems,
      payment: payment || null,
    },
  };
};

export const updateOrderStatusService = async (orderId, newStatus) => {
  const order = await db("orders").where({ id: orderId }).first();

  if (!order) {
    return {
      status: false,
      statusCode: 404,
      message: "Order not found",
    };
  }

  const currentStatus = order.status;

  if (currentStatus === newStatus) {
    return {
      status: true,
      statusCode: 200,
      message: "Order status is already " + newStatus,
    };
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowed || !allowed.includes(newStatus)) {
    return {
      status: false,
      statusCode: 400,
      message: `Status transition from ${currentStatus} to ${newStatus} is not allowed`,
    };
  }

  await db("orders")
    .where({ id: orderId })
    .update({ status: newStatus, updated_at: db.fn.now() });

  return {
    status: true,
    statusCode: 200,
    message: "Order status updated successfully",
  };
};
