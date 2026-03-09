import express from "express";
import * as Controller from "./cart.controller.js";
import validate from "../../common/middlewares/validate.js";
import authMiddleware from "../../common/middlewares/auth.middleware.js"; 
import * as Schemas from "./cart.validate.js";

const router = express.Router();
 router.use(authMiddleware);

router.post('/addCart',validate({ body: Schemas.addCartItemSchema }), Controller.addItemToCart);
router.get('/getCart', Controller.getMyCart);
router.put('/updateCartItem/:itemId',validate({ body: Schemas.updateCartItemSchema ,params: Schemas.itemIdParamSchema}), Controller.updateCartItem);
router.delete('/deleteCartItem/:itemId',validate({ params: Schemas.itemIdParamSchema }), Controller.deleteCartItem);
router.delete('/clearCart', Controller.clearCart);

export default router;