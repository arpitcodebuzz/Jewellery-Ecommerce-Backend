import Joi from "joi";

export const addStoneSchema = Joi.object({
  stone_type: Joi.string().trim().max(50).required(), // diamond, cz, ruby...

  clarity_grade: Joi.string().trim().max(20).allow(null, "").optional(),
  color_grade: Joi.string().trim().max(20).allow(null, "").optional(),
  cut_grade: Joi.string().trim().max(20).allow(null, "").optional(),

  weight_carat: Joi.number().precision(3).greater(0).required(),
  piece_count: Joi.number().integer().min(1).default(1),
});

export const updateStoneSchema = Joi.object({
  stone_type: Joi.string().trim().max(50).optional(),

  clarity_grade: Joi.string().trim().max(20).allow(null, "").optional(),
  color_grade: Joi.string().trim().max(20).allow(null, "").optional(),
  cut_grade: Joi.string().trim().max(20).allow(null, "").optional(),

  weight_carat: Joi.number().precision(3).greater(0).optional(),
  piece_count: Joi.number().integer().min(1).optional(),
}).min(1);

export const productIdSchema = Joi.object({
  productId: Joi.number().integer().positive().required()
});

export const stoneIdSchema = Joi.object({
  stoneId: Joi.number().integer().positive().required()
});