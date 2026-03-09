import Joi from "joi";

export const addCartItemSchema = Joi.object({
  product_id: Joi.number().integer().positive().required().messages({
    "any.required": "Product id is required",
    "number.base": "Product id must be a number",
    "number.integer": "Product id must be an integer",
    "number.positive": "Product id must be greater than 0",
  }),

  quantity: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
  }),
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    "any.required": "Quantity is required",
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
  }),
}); 


export const itemIdParamSchema = Joi.object({
  itemId: Joi.number().integer().positive().required().messages({
    "any.required": "Item id is required",
    "number.base": "Item id must be a number",
    "number.integer": "Item id must be an integer",
    "number.positive": "Item id must be greater than 0",
  }),
});