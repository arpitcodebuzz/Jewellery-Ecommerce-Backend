import Joi from "joi";

export const createMetalRateSchema = Joi.object({
  metal_type: Joi.string().valid("gold", "silver", "platinum").required(),
  purity_code: Joi.string().trim().max(20).required(), // "22K", "925"
  rate_per_gram: Joi.number().positive().precision(2).required(),
  effective_from: Joi.date().optional(), // if omitted -> now
});

export const updateMetalRateSchema = Joi.object({
  metal_type: Joi.string().valid("gold", "silver", "platinum").optional(),
  purity_code: Joi.string().trim().max(20).optional(),
  rate_per_gram: Joi.number().positive().precision(2).optional(),
  effective_from: Joi.date().optional(),
}).min(1);

export const listMetalRateSchema = Joi.object({
  metal_type: Joi.string().valid("gold", "silver", "platinum").optional(),
  purity_code: Joi.string().trim().max(20).optional(),
  from: Joi.date().optional(),
  to: Joi.date().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(20),
});

export const latestMetalRateSchema = Joi.object({
  metal_type: Joi.string().valid("gold", "silver", "platinum").required(),
  purity_code: Joi.string().trim().max(20).required(),
});

export const metalRateIdSchema = Joi.object({
  metalRateId: Joi.number().integer().positive().required()
});