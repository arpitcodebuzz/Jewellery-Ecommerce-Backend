import express from "express";
import * as Controller from "./orders.controller.js";
import validate from "../../common/middlewares/validate.js";
import authMiddleware from "../../common/middlewares/auth.middleware.js"; 
import * as Schemas from "./orders.validate.js";

const router = express.Router();
 router.use(authMiddleware);

router.post('/checkout',validate({body: Schemas.checkoutSchema}),Controller.checkOutOrder);
router.get('/getMyOrders', Controller.getMyOrders);
router.get('/getOrderById/:orderId',validate({ params: Schemas.orderIdParamSchema }), Controller.getOrderById);
router.get('/cancelOrder/:orderId',validate({ params: Schemas.orderIdParamSchema }), Controller.cancelOrder);

export default router;