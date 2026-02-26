import express from "express";
import * as Controller from "./products_stones.controllers.js";
import validate from "../../common/middlewares/validate.js";
import authMiddleware from "../../common/middlewares/auth.middleware.js";
import isAdmin from "../../common/middlewares/isAdminMiddleware.js";
import { addStoneSchema,updateStoneSchema,productIdSchema,stoneIdSchema} from "./validate.js";


const router = express.Router();

// router.use(authMiddleware, isAdmin);

router.post('/:productId/addStone',validate({ body: addStoneSchema }), Controller.addProductStone);

router.get('/:productId/getStones', Controller.getAllProductStones);

router.put('/:productId/updateStone/:stoneId',validate({ body: updateStoneSchema , params: stoneIdSchema.concat(productIdSchema)}), Controller.updateProductStone);

router.delete('/:productId/deleteStone/:stoneId',validate({ params: stoneIdSchema.concat(productIdSchema) }), Controller.deleteProductStone);



export default router;
