import express from "express";
import * as Controller from "./stone_rates.controllers.js";
import validate from "../../common/middlewares/validate.js";
import authMiddleware from "../../common/middlewares/auth.middleware.js";
import isAdmin from "../../common/middlewares/isAdminMiddleware.js";
import {
  createStoneRateSchema,
  updateStoneRateSchema,
  listStoneRateSchema,
  stoneRateIdParamSchema,
  changeStoneRateStatusSchema
} from "./validate.js";


const router = express.Router();

// router.use(authMiddleware, isAdmin);

router.post('/addStoneRate', validate({ body: createStoneRateSchema }), Controller.addStoneRate);

router.get('/getStoneRates', validate({ query: listStoneRateSchema }), Controller.getAllStoneRates);

router.put('/updateStoneRate/:stoneRateId', validate({ body: updateStoneRateSchema, params: stoneRateIdParamSchema }), Controller.updateStoneRate);

router.patch('/changeStatusStoneRate/:stoneRateId', validate({ body: changeStoneRateStatusSchema, params: stoneRateIdParamSchema }), Controller.changeStatusStoneRate);

router.get('/getLatestStoneRate', Controller.getLatestStoneRate);

export default router;
