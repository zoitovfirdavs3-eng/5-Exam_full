const Joi = require("joi");

const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  image: Joi.string().allow("").optional()
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(80).optional(),
  image: Joi.string().allow("").optional()
}).min(1);

module.exports = { createCategorySchema, updateCategorySchema };

