import Joi from "joi";

const stoneTypeEnum = ["diamond", "cz", "ruby", "emerald", "sapphire", "moissanite"];

export const createStoneRateSchema = Joi.object({
  stone_type: Joi.string()
    .trim()
    .lowercase()
    .valid(...stoneTypeEnum)
    .required(),

  clarity_grade: Joi.string().trim().max(20).allow(null, "").optional(),
  color_grade: Joi.string().trim().max(20).allow(null, "").optional(),
  cut_grade: Joi.string().trim().max(20).allow(null, "").optional(), // if you added it

  rate_per_carat: Joi.number().positive().precision(2).required(),

  effective_from: Joi.date().required(), // accepts YYYY-MM-DD from frontend
  status: Joi.string().valid("active", "inactive").optional().default("active"),
});

export const updateStoneRateSchema = Joi.object({
  stone_type: Joi.string()
    .trim()
    .lowercase()
    .valid(...stoneTypeEnum)
    .optional(),

  clarity_grade: Joi.string().trim().max(20).allow(null, "").optional(),
  color_grade: Joi.string().trim().max(20).allow(null, "").optional(),
  cut_grade: Joi.string().trim().max(20).allow(null, "").optional(),

  rate_per_carat: Joi.number().positive().precision(2).optional(),
  effective_from: Joi.date().optional(),
  status: Joi.string().valid("active", "inactive").optional(),
}).min(1);

export const listStoneRateSchema = Joi.object({
  stone_type: Joi.string().trim().lowercase().optional(),
  clarity_grade: Joi.string().trim().max(20).allow("", null).optional(),
  color_grade: Joi.string().trim().max(20).allow("", null).optional(),
  status: Joi.string().valid("active", "inactive").optional(),
  from: Joi.date().optional(), // effective_from >= from
  to: Joi.date().optional(),   // effective_from <= to
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

export const stoneRateIdParamSchema = Joi.object({
  stoneRateId: Joi.number().integer().positive().required(),
});

export const changeStoneRateStatusSchema = Joi.object({
  status: Joi.string().valid("active", "inactive").required(),
});