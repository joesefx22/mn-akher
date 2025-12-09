// controllers/booking.controller.js
// =======================================================================

const bookingService = require("../services/booking.service");
const { asyncWrapper } = require("../utils/asyncWrapper");

exports.list = asyncWrapper(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  const data = await bookingService.listBookings(userId, role);

  return res.status(200).json({
    status: "success",
    total: data.length,
    data,
  });
});

exports.details = asyncWrapper(async (req, res) => {
  const bookingId = req.params.id;
  const data = await bookingService.getBooking(bookingId);

  return res.status(200).json({
    status: "success",
    data,
  });
});

exports.create = asyncWrapper(async (req, res) => {
  const userId = req.user.id;
  const data = await bookingService.createBooking(userId, req.body);

  return res.status(201).json({
    status: "success",
    data,
  });
});

exports.cancel = asyncWrapper(async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.user.id;
  const role = req.user.role;

  const data = await bookingService.cancelBooking(bookingId, userId, role);

  return res.status(200).json({
    status: "success",
    message: "Booking cancelled",
    data,
  });
});
