import Joi from 'joi';

export const sendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  purpose: Joi.string().valid('VERIFY_EMAIL', 'FORGOT_PASSWORD').required()
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  purpose: Joi.string().valid('VERIFY_EMAIL', 'FORGOT_PASSWORD').required()
});

export const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

export const createAccountSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().pattern(/^[0-9+]{10,15}$/).required(),
  password: Joi.string().min(6).max(30).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required()
});

export const changePasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  old_password: Joi.string().required(),
  new_password: Joi.string().min(6).max(30).required()
});

export const updateProfileSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().pattern(/^[0-9+]{10,15}$/).required()
});


export const goolgeLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().trim().min(2).max(100).required(),
  google_id: Joi.string().required()
});