import Joi from "joi";

export const checkoutSchema = Joi.object({
  shipping_name: Joi.string().trim().max(150).required(),
  shipping_email: Joi.string().email().max(150).allow(null, ""),
  shipping_phone: Joi.string().trim().max(20).allow(null, ""),

  shipping_address_line1: Joi.string().trim().max(255).required(),
  shipping_address_line2: Joi.string().trim().max(255).allow(null, ""),
  shipping_city: Joi.string().trim().max(100).required(),
  shipping_state: Joi.string().trim().max(100).required(),
  shipping_postal_code: Joi.string().trim().max(20).required(),
  shipping_country: Joi.string().trim().max(100).default("India"),

  payment_gateway: Joi.string()
    .valid("razorpay", "stripe", "cashfree", "manual")
    .default("razorpay"),

  payment_method: Joi.string()
    .valid("card", "upi", "netbanking", "wallet", "cod", "unknown")
    .default("unknown"),

  notes: Joi.string().trim().allow(null, ""),
});

export const orderIdParamSchema = Joi.object({
  orderId: Joi.number().integer().positive().required(),
});