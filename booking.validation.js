// validations/booking.validation.js
// =======================================================================

const Joi = require("joi");

exports.createBookingValidation = Joi.object({
  pitchId: Joi.number().required(),
  date: Joi.string().required(), // yyyy-mm-dd
  startTime: Joi.string().required(), // "14:00"
  endTime: Joi.string().required(),
});

exports.cancelBookingValidation = Joi.object({});
