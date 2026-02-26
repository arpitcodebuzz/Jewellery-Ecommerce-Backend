import Joi from "joi";

/**
 * LOGIN
 */

export const createCategorySchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
});

export const categoryIdSchema = Joi.object({
id: Joi.number().integer().positive().required()
});
