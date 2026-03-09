import Joi from "joi";

/*
|--------------------------------------------------------------------------
| Create Address Validation
|--------------------------------------------------------------------------
*/
export const createAddressSchema = Joi.object({
  full_name: Joi.string()
    .trim()
    .min(2)
    .max(120)
    .required()
    .messages({
      "string.empty": "Full name is required",
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone must be a valid 10 digit number",
    }),

  address_line1: Joi.string()
    .trim()
    .max(255)
    .required()
    .messages({
      "string.empty": "Address line 1 is required",
    }),

  address_line2: Joi.string()
    .trim()
    .max(255)
    .allow(null, ""),

  city: Joi.string()
    .trim()
    .max(100)
    .required(),

  state: Joi.string()
    .trim()
    .max(100)
    .required(),

  postal_code: Joi.string()
    .trim()
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Postal code must be 6 digits",
    }),

  country: Joi.string()
    .trim()
    .max(100)
    .default("India"),

  is_default: Joi.boolean().optional(),

  address_type: Joi.string()
    .valid("home", "work", "other")
    .default("home"),
});


/*
|--------------------------------------------------------------------------
| Update Address Validation
|--------------------------------------------------------------------------
*/
export const updateAddressSchema = Joi.object({
  full_name: Joi.string().trim().min(2).max(120),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/),

  address_line1: Joi.string().trim().max(255),

  address_line2: Joi.string().trim().max(255).allow(null, ""),

  city: Joi.string().trim().max(100),

  state: Joi.string().trim().max(100),

  postal_code: Joi.string()
    .trim()
    .pattern(/^[0-9]{6}$/),

  country: Joi.string().trim().max(100),

  is_default: Joi.boolean(),

  address_type: Joi.string().valid("home", "work", "other"),
}).min(1); // at least one field required


export const addressIdParamSchema = Joi.object({
  addressId: Joi.number().integer().positive().required(),
});