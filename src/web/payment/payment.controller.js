import { verifyRazorpayPaymentService } from "./payment.service.js";

export const verifyRazorpayPaymentController = async (req, res) => {
  const result = await verifyRazorpayPaymentService(req.body);

  return res.status(result.statusCode).json(result);
};