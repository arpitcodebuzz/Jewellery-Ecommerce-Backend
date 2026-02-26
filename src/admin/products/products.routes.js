import express from "express";
import * as Controller from ".//products.controllers.js";
import validate from "../../common/middlewares/validate.js";
import authMiddleware from "../../common/middlewares/auth.middleware.js";
import isAdmin from "../../common/middlewares/isAdminMiddleware.js";
import { createProductSchema,updateProductSchema,productIdSchema,updateProductStatusSchema } from "./validate.js";


const router = express.Router();

// router.use(authMiddleware, isAdmin);

router.post('/addProduct',validate({ body: createProductSchema }), Controller.createProduct);

router.get('/getProducts', Controller.getAllProducts);

router.put('/updateProduct/:id',validate({ body: updateProductSchema ,params: productIdSchema}), Controller.updateProduct);

router.put('/updateProductStatus/:id',validate({ body: updateProductStatusSchema ,params: productIdSchema}), Controller.updateProductStatus);

router.delete('/deleteProduct/:id',validate({ params: productIdSchema }), Controller.deleteProduct);



export default router;
