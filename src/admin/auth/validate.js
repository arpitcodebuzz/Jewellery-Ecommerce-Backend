import Joi from "joi";

/**
 * LOGIN
 */

export const createAdminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().required()
})

export const loginAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});