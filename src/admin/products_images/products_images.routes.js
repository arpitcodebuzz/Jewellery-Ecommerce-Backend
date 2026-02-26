import express from "express";
import * as Controller from "./products_images.controllers.js";
import validate from "../../common/middlewares/validate.js";
import authMiddleware from "../../common/middlewares/auth.middleware.js";
import isAdmin from "../../common/middlewares/isAdminMiddleware.js";
import { productIdParamSchema,productImageIdParamSchema} from "./validate.js";
import {uploadProductImage} from "../../common/middlewares/mediaUploadMiddlewares/upload.products.image.middleware.js";


const router = express.Router();

// router.use(authMiddleware, isAdmin);

router.post('/addProductImage/:productId',validate({params: productIdParamSchema }),uploadProductImage.single("image"), Controller.addProductImage);

router.get('/getProductImages/:productId',validate({params: productIdParamSchema }), Controller.getProductImages);

router.delete('/deleteProductImage/:productId/:imageId',validate({ params: productImageIdParamSchema }), Controller.deleteProductImage);



export default router;
