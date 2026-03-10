import { Router } from "express";
import { verifyRazorpayPaymentController } from "./payment.controller.js";
import validate from "../../common/middlewares/validate.js";
import { verifyRazorpayPaymentSchema } from "./payment.validate.js";

const router = Router();

router.post(
  "/verify",
   validate({ body: verifyRazorpayPaymentSchema }),
  verifyRazorpayPaymentController
);

export default router;