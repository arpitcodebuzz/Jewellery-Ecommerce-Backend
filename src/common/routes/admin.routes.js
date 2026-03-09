import express from 'express';
import authroutes from '../../admin/Auth/auth.routes.js';
import categoryRoutes from '../../admin/categories/categories.routes.js';
import collectionRoutes from '../../admin/collections/collection.routes.js';
import productRoutes from '../../admin/products/products.routes.js';
import productMetalRoutes from '../../admin/products_metals/products_metals.routes.js'
import productStoneRoutes from '../../admin/products_stones/products_stones.routes.js'
import productImageRoutes from '../../admin/products_images/products_images.routes.js'
import metalRatesRoutes from '../../admin/metal_rates/metal_rates.routes.js'
import stoneRatesRoutes from '../../admin/stone_rates/stone_rates.routes.js'
import adminOrdersRoutes from '../../admin/orders/adminOrders.routes.js'


const router = express.Router();

router.use('/auth', authroutes);
router.use('/categories', categoryRoutes);
router.use('/collections', collectionRoutes);
router.use('/products', productRoutes);
router.use('/products_metals', productMetalRoutes);
router.use('/products_stones', productStoneRoutes);
router.use('/products_images', productImageRoutes);
router.use('/metal_rates', metalRatesRoutes);
router.use('/stone_rates', stoneRatesRoutes);
router.use('/orders', adminOrdersRoutes);


export default router;
