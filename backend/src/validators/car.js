const Joi = require("joi");

const createCarSchema = Joi.object({
  car_name: Joi.string().min(1).max(100).required(),
  car_category: Joi.string().required(), // ObjectId string
  car_tonirovka: Joi.boolean().optional(),
  car_motor: Joi.string().min(1).max(50).required(),
  car_year: Joi.number().min(1950).max(2035).required(),
  car_color: Joi.string().min(1).max(50).required(),
  car_distance: Joi.string().min(1).max(50).required(),
  car_gearbook: Joi.string().allow("").optional(),
  car_description: Joi.string().min(3).max(2000).required(),
  car_price: Joi.number().min(0).required(),
  car_image: Joi.string().allow("").optional()
});

const updateCarSchema = Joi.object({
  car_name: Joi.string().min(1).max(100).optional(),
  car_category: Joi.string().optional(),
  car_tonirovka: Joi.boolean().optional(),
  car_motor: Joi.string().min(1).max(50).optional(),
  car_year: Joi.number().min(1950).max(2035).optional(),
  car_color: Joi.string().min(1).max(50).optional(),
  car_distance: Joi.string().min(1).max(50).optional(),
  car_gearbook: Joi.string().allow("").optional(),
  car_description: Joi.string().min(3).max(2000).optional(),
  car_price: Joi.number().min(0).optional(),
  car_image: Joi.string().allow("").optional()
}).min(1);

module.exports = { createCarSchema, updateCarSchema };

