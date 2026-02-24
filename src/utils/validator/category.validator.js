const Joi = require("joi");

const createCategoryValidator = Joi.object({
  category_id: Joi.number().integer().min(1).optional().messages({
    "number.base": "Category id must be a number !",
    "number.integer": "Category id must be an integer !",
    "number.min": "Category id must be >= 1 !",
  }),
  category_name: Joi.string().trim().min(2).required().messages({
    "string.empty": "Category name is required !",
    "string.min": "Category name must be at least 2 characters",
    "any.required": "Category name is required !",
  }),
});

module.exports = createCategoryValidator;