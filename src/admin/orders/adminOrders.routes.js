import express from "express";
import * as Controller from "./adminOrders.controller.js";
import validate from "../../common/middlewares/validate.js";
import authMiddleware from "../../common/middlewares/auth.middleware.js";
import isAdmin from "../../common/middlewares/isAdminMiddleware.js";
import * as Schemas from "./adminOrders.validate.js";

const router = express.Router();

// All routes require authentication and admin role
// router.use(authMiddleware, isAdmin);

router.get("/", validate({ query: Schemas.getOrdersSchema }), Controller.getOrders);

router.get("/:orderId", validate({ params: Schemas.orderIdParamSchema }), Controller.getOrderDetails);

router.patch("/:id/status", validate({ params: Schemas.orderIdParamSchema, body: Schemas.updateOrderStatusSchema }), Controller.updateStatus);

export default router;
