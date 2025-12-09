// validations/pitch.validation.js
// ==============================================================

const Joi = require("joi");

exports.createPitchValidation = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  areaId: Joi.number().required(),
  pricePerHour: Joi.number().min(10).max(1000).required(),
  description: Joi.string().allow(""),
  images: Joi.array().items(Joi.string()).default([]),
});

exports.updatePitchValidation = Joi.object({
  name: Joi.string().min(3).max(50),
  pricePerHour: Joi.number().min(10).max(1000),
  description: Joi.string().allow(""),
  images: Joi.array().items(Joi.string()),
});
