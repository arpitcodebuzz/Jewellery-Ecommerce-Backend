import Joi from "joi";

/**
 * LOGIN
 */

export const addCollectionSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
});

export const updateCollectionSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
});

export const collectionIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
