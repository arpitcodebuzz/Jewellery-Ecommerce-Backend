import express from "express";
import * as Controller from "./auth.controllers.js";
import validate from "../../common/middlewares/validate.js";
import {  createAdminSchema, loginAdminSchema}from "./validate.js";
import authMiddleware from "../../common/middlewares/auth.middleware.js";
import isAdmin from "../../common/middlewares/isAdminMiddleware.js";


const router = express.Router();


router.post('/create-admin',validate({ body: createAdminSchema }), Controller.createAdmin);
// login admin
router.post(
  "/login",
  validate({ body: loginAdminSchema }),
  Controller.loginAdmin
);


//check logoout api

router.post('/logout', authMiddleware,isAdmin, Controller.logoutAdmin);





export default router;
