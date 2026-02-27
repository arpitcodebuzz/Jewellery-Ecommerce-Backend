import express from "express";
import * as Controller from "../../admin/products/products.controllers.js";

import authMiddleware from "../../common/middlewares/auth.middleware.js";




const router = express.Router();

// router.use(authMiddleware);
router.get('/getProducts', Controller.getAllProducts);


export default router;
