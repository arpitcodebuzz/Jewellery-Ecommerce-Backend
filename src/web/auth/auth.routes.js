import express from "express";
import * as Controller from "./auth.controller.js";
import validate from "../../common/middlewares/validate.js";
import authMiddleware from "../../common/middlewares/auth.middleware.js"; 
import * as Schemas from "./auth.validate.js";

const router = express.Router();

router.post('/send-otp', validate({ body: Schemas.sendOtpSchema }), Controller.sendOtp);
router.post('/verify-otp', validate({ body: Schemas.verifyOtpSchema }), Controller.verifyOtp);
router.post('/verify-email', validate({ body: Schemas.verifyEmailSchema }), Controller.verifyEmail);
router.post('/create-account', validate({ body: Schemas.createAccountSchema }), Controller.createAccount);
router.post('/login', validate({ body: Schemas.loginSchema }), Controller.login);

router.post('/forgot-password', authMiddleware, validate({ body: Schemas.forgotPasswordSchema }), Controller.forgotPassword);
router.post('/change-password', authMiddleware, validate({ body: Schemas.changePasswordSchema }), Controller.changePassword);
router.get('/get-profile', authMiddleware, Controller.getProfile);
router.put('/update-profile', authMiddleware, validate({ body: Schemas.updateProfileSchema }), Controller.updateProfile);
router.post('/google-login', validate({ body: Schemas.goolgeLoginSchema}), Controller.googleLogin);
router.post('/logout', authMiddleware, Controller.logout);

export default router;