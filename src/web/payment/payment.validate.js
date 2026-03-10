import Joi from "joi";

export const verifyRazorpayPaymentSchema = Joi.object({
  orderId: Joi.number().integer().positive().required(),
  razorpay_order_id: Joi.string().trim().required(),
  razorpay_payment_id: Joi.string().trim().required(),
  razorpay_signature: Joi.string().trim().required(),
});