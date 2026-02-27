import * as service from './auth.service.js';
import { revokeTokenByValue } from '../../common/utils/jwt.js';

const sendResponse = (res, result) => {
  return res.status(result.statusCode).json({
    status: result.status,
    message: result.message,
    data: result.data ?? null
  });
};

export const sendOtp = async (req, res) => {
  try {
    const result = await service.sendOtpService(req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const result = await service.verifyOtpService(req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const result = await service.verifyEmailService(req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};

export const createAccount = async (req, res) => {
  try {
    const result = await service.createAccountService(req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};

// auth.controller.js
export const login = async (req, res) => {


  try {
    const result = await service.loginService(req.body, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      device: req.headers["x-device-name"] || "unknown"
    });
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong !!" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const result = await service.forgotPasswordService(req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const result = await service.changePasswordService(req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const result = await service.getProfileService(req.user.id);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const result = await service.updateProfileService(req.user.id, req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const result = await service.googleLoginService(req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Something went wrong !!' });
  }
};

export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        status: false,
        message: "Authorization token required"
      });
    }

    const token = authHeader.split(" ")[1];

    await revokeTokenByValue(token);

    return res.status(200).json({
      status: true,
      message: "Logged out from this device successfully"
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong !!" });
  }
};
