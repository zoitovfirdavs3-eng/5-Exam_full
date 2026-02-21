const Joi = require("joi");

const carValidator = Joi.object({
  car_name: Joi.string().trim().required().messages({
    "string.base": "Car name must be a string !",
    "string.empty": "Car name is required !",
    "any.required": "Car name is required !",
  }),

  car_category: Joi.string().required().messages({
    "string.base": "Car category must be a string !",
    "string.empty": "Car category is required !",
    "any.required": "Car category is required !",
  }),

  car_tonirovka: Joi.string().lowercase().valid("bor", "yo'q").messages({
    "string.base": "Car tonirovka must be a string !",
    "any.only": "Car tonirovka must be either 'bor' or 'yoq' !",
    "any.required": "Car tonirovka is required !",
  }),

  car_motor: Joi.string().trim().required().messages({
    "string.base": "Car motor must be a string !",
    "string.empty": "Car motor is required !",
    "any.required": "Car motor is required !",
  }),

  car_year: Joi.number().required().messages({
    "number.base": "Car year must be a number !",
    "any.required": "Car year is required !",
  }),

  car_color: Joi.string().trim().required().messages({
    "string.base": "Car color must be a string !",
    "string.empty": "Car color is required !",
    "any.required": "Car color is required !",
  }),

  car_distance: Joi.number().required().messages({
    "number.base": "Car distance must be a number !",
    "number.empty": "Car distance is required !",
    "any.required": "Car distance is required !",
  }),

  car_gearbook: Joi.string().lowercase().valid("avtomat", "mexanik").trim().messages({
    "string.base": "Car gearbox must be a string !",
  }),

  car_description: Joi.string().min(10).required().messages({
    "string.base": "Car description must be a string !",
    "string.empty": "Car description is required !",
    "string.min": "Car description must be at least 10 characters !",
    "any.required": "Car description is required !",
  }),

  car_price: Joi.number().required().messages({
    "number.base": "Car price must be a number !",
    "any.required": "Car price is required !",
  }),

  car_image: Joi.string().messages({
    "string.base": "Car image must be a string (URL) !",
  }),
});

module.exports = carValidator;
