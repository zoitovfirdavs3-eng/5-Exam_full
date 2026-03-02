const Joi = require("joi");

const registerSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  age: Joi.number().min(12).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(64).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(64).required()
});

module.exports = { registerSchema, loginSchema };
