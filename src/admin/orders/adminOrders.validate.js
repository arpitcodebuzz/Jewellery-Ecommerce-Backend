import Joi from "joi";

export const getOrdersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid(
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "failed"
  ),
  order_number: Joi.string().trim(),
  user_id: Joi.number().integer().positive(),
  date_from: Joi.date().iso(),
  date_to: Joi.date().iso().min(Joi.ref("date_from")),
});

export const orderIdParamSchema = Joi.object({
  orderId: Joi.number().integer().positive().required(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid(
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "failed"
  ).required(),
});
