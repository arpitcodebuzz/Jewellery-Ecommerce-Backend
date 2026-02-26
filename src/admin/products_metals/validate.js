import Joi from "joi";

export const addMetalSchema = Joi.object({
  metal_type: Joi.string().valid("gold", "silver", "platinum").required(),
  purity_code: Joi.string().trim().max(10).required(), // 22K, 18K, 925
  purity_value: Joi.number().precision(2).min(0).max(100).required(), // 91.6, 92.5
  weight_grams: Joi.number().precision(3).greater(0).required(),
  is_primary: Joi.boolean().optional(),
});

export const updateMetalSchema = Joi.object({
  metal_type: Joi.string().valid("gold", "silver", "platinum").optional(),
  purity_code: Joi.string().trim().max(10).optional(),
  purity_value: Joi.number().precision(2).min(0).max(100).optional(),
  weight_grams: Joi.number().precision(3).greater(0).optional(),
  is_primary: Joi.boolean().optional(),
}).min(1);


export const metalIdSchema = Joi.object({
  metalId: Joi.number().integer().positive().required()
});

export const productIdSchema = Joi.object({
  productId: Joi.number().integer().positive().required()
})