import express from "express";
import * as Controller from "./products_metals.controllers.js";
import validate from "../../common/middlewares/validate.js";
import authMiddleware from "../../common/middlewares/auth.middleware.js";
import isAdmin from "../../common/middlewares/isAdminMiddleware.js";
import { addMetalSchema,updateMetalSchema,metalIdSchema,productIdSchema } from "./validate.js";


const router = express.Router();

// router.use(authMiddleware, isAdmin);

router.post('/:productId/addMetal',validate({ body: addMetalSchema }), Controller.addProductMetal);

router.get('/:productId/getMetals', Controller.getAllProductMetals);

router.put('/:productId/updateMetal/:metalId',validate({ body: updateMetalSchema , params: metalIdSchema.concat(productIdSchema)}), Controller.updateProductMetal);

router.delete('/:productId/deleteMetal/:metalId',validate({ params: metalIdSchema }), Controller.deleteProductMetal);


export default router;
