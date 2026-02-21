const Joi = require("joi");

const registerValidator = Joi.object({
  first_name: Joi.string().trim().required().messages({
    "string.base": "First name must be a string !",
    "string.empty": "First name is required !",
    "any.required": "First name is required !",
  }),

  last_name: Joi.string().trim().required().messages({
    "string.base": "Last name must be a string !",
    "string.empty": "Last name is required !",
    "any.required": "Last name is required !",
  }),

  age: Joi.number().min(12).max(100).required().messages({
    "number.base": "Age must be a number !",
    "number.min": "Age must be at least 12 !",
    "number.max": "Age must be less than 100 !",
    "any.required": "Age is required !",
  }),

  email: Joi.string().email().trim().required().messages({
    "string.email": "Email must be a valid email address !",
    "string.empty": "Email is required !",
    "any.required": "Email is required !",
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": "Password must be a string !",
    "string.empty": "Password is required !",
    "string.min": "Password must be at least 6 characters !",
    "any.required": "Password is required !",
  }),
});

const loginValidator = Joi.object({
  email: Joi.string().email().trim().required().messages({
    "string.email": "Email must be a valid email address !",
    "string.empty": "Email is required !",
    "any.required": "Email is required !",
  }),

  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required !",
    "string.min": "Password must be at least 6 characters !",
    "any.required": "Password is required !",
  }),
});

const resendOtpOrForgotPasswordValidator = Joi.object({
  email: Joi.string().email().trim().required().messages({
    "string.email": "Email must be a valid email address !",
    "string.empty": "Email is required !",
    "any.required": "Email is required !",
  }),
});

const changePasswordValidator = Joi.object({
  email: Joi.string().email().trim().required().messages({
    "string.email": "Email must be a valid email address !",
    "string.empty": "Email is required !",
    "any.required": "Email is required !",
  }),

  new_password: Joi.string().min(6).required().messages({
    "string.empty": "New password is required !",
    "string.min": "New password must be at least 6 characters !",
    "any.required": "New password is required !",
  }),
});

const profileVerifiedValidator = Joi.object({
  email: Joi.string().email().trim().required().messages({
    "string.email": "Email must be a valid email address !",
    "string.empty": "Email is required !",
    "any.required": "Email is required !",
  }),

  otp: Joi.number().required().messages({
    "number.empty": "OTP code is required !",
    "number.length": "OTP must be exactly 6 digits !",
    "any.required": "OTP code is required !",
  }),
  role: Joi.string().valid("user", "admin").trim().lowercase().default("user"),
});

module.exports = {
  registerValidator,
  loginValidator,
  resendOtpOrForgotPasswordValidator,
  changePasswordValidator,
  profileVerifiedValidator,
};
