// routes/booking.routes.js
// =======================================================================

const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/booking.controller");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const roleGuard = require("../middleware/roleGuard");
const {
  createBookingValidation,
  cancelBookingValidation,
} = require("../validations/booking.validation");

// LIST BOOKINGS
router.get("/list", auth, bookingController.list);

// BOOKING DETAILS
router.get("/:id", auth, bookingController.details);

// CREATE BOOKING
router.post(
  "/create",
  auth,
  roleGuard(["player"]),
  validate(createBookingValidation),
  bookingController.create
);

// CANCEL BOOKING
router.post(
  "/cancel/:id",
  auth,
  validate(cancelBookingValidation),
  bookingController.cancel
);

module.exports = router;
