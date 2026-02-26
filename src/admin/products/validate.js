import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  sku: Joi.string().trim().min(2).max(100).required(),

  product_type: Joi.string()
    .valid("ring", "earring", "pendant", "kada", "bracelet", "chain", "coin", "bar")
    .required(),

  target_gender: Joi.string().valid("men", "women", "unisex").required(),

  category_id: Joi.number().integer().positive().required(),
  collection_id: Joi.number().integer().positive().allow(null).optional(),

  default_metal_type: Joi.string().valid("gold", "silver", "platinum").required(),

  making_charge_type: Joi.string().valid("per_gram", "fixed").required(),
  making_charge_value: Joi.number().precision(2).min(0).required(),

  wastage_percent: Joi.number().precision(2).min(0).max(100).default(0),
  margin_percent: Joi.number().precision(2).min(0).max(100).default(0),

  gst_percent: Joi.number().precision(2).min(0).max(100).default(3),

  status: Joi.string().valid("active", "inactive").default("active"),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).optional(),
  sku: Joi.string().trim().min(2).max(100).optional(),

  product_type: Joi.string()
    .valid("ring", "earring", "pendant", "kada", "bracelet", "chain", "coin", "bar")
    .optional(),

  target_gender: Joi.string().valid("men", "women", "unisex").optional(),

  category_id: Joi.number().integer().positive().optional(),
  collection_id: Joi.number().integer().positive().allow(null).optional(),

  default_metal_type: Joi.string().valid("gold", "silver", "platinum").optional(),

  making_charge_type: Joi.string().valid("per_gram", "fixed").optional(),
  making_charge_value: Joi.number().precision(2).min(0).optional(),

  wastage_percent: Joi.number().precision(2).min(0).max(100).optional(),
  margin_percent: Joi.number().precision(2).min(0).max(100).optional(),

  gst_percent: Joi.number().precision(2).min(0).max(100).optional(),

  status: Joi.string().valid("active", "inactive").optional(),
}).min(1);

export const updateProductStatusSchema = Joi.object({
  status: Joi.string().valid("active", "inactive").required(),
});

export const productIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});