import Joi from "joi";

export const productIdParamSchema = Joi.object({
  productId: Joi.number().integer().positive().required()
});

export const productImageIdParamSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  imageId: Joi.number().integer().positive().required()
});