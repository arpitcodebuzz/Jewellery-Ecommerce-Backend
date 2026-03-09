import express from "express";

import authroutes from '../../web/Auth/auth.routes.js';
import productsRoutes from '../../web/products/products.routes.js';
import addressesRoutes from '../../web/addresses/addresses.routes.js';
import cartRoutes from '../../web/cart/cart.routes.js';
import orderRoutes from '../../web/orders/orders.routes.js';

const router = express.Router();

router.use('/auth', authroutes);
router.use('/products', productsRoutes);
router.use('/addresses', addressesRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

export default router;