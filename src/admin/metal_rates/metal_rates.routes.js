import express from "express";
import * as Controller from "./metal_rates.controllers.js";
import validate from "../../common/middlewares/validate.js";
import authMiddleware from "../../common/middlewares/auth.middleware.js";
import isAdmin from "../../common/middlewares/isAdminMiddleware.js";
import {createMetalRateSchema,updateMetalRateSchema,listMetalRateSchema,metalRateIdSchema} from "./validate.js";


const router = express.Router();

// router.use(authMiddleware, isAdmin);
router.post('/addMetalRate',validate({ body: createMetalRateSchema }), Controller.addMetalRate);

router.get('/getMetalRates',validate({ query: listMetalRateSchema }), Controller.getAllMetalRates);

router.put('/updateMetalRate/:metalRateId',validate({ body: updateMetalRateSchema ,params: metalRateIdSchema}), Controller.updateMetalRate);

router.delete('/deleteMetalRate/:metalRateId',validate({ params: metalRateIdSchema }), Controller.deleteMetalRate);

export default router;
