const Joi = require("joi");

const updateProfileSchema = Joi.object({
  first_name: Joi.string().trim().min(2).max(50).required(),
  last_name: Joi.string().trim().min(2).max(50).required(),
  age: Joi.number().integer().min(12).max(100).required()
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required()
});

module.exports = {
  updateProfileSchema,
  changePasswordSchema
};
