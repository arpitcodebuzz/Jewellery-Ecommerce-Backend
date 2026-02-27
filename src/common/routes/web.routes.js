import express from "express";

import authroutes from '../../web/Auth/auth.routes.js';
import productsRoutes from '../../web/products/products.routes.js';

const router = express.Router();

router.use('/auth', authroutes);
router.use('/products', productsRoutes);

export default router;