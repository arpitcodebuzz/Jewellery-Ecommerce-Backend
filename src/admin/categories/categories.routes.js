import express from "express";
import * as Controller from "./categories.controllers.js";
import validate from "../../common/middlewares/validate.js";
import authMiddleware from "../../common/middlewares/auth.middleware.js";
import isAdmin from "../../common/middlewares/isAdminMiddleware.js";
import { categoryIdSchema, updateCategorySchema, createCategorySchema } from "./validate.js";


const router = express.Router();

// router.use(authMiddleware, isAdmin);

router.post('/addCategory',validate({ body: createCategorySchema }), Controller.addCategory);

router.get('/getCategories', Controller.getAllCategories);

router.put('/updateCategory/:id',validate({ body: updateCategorySchema ,params: categoryIdSchema}), Controller.updateCategory);

router.delete('/deleteCategory/:id',validate({ params: categoryIdSchema }), Controller.deleteCategory);

export default router;
