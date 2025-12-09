// routes/pitch.routes.js
// ==============================================================

const express = require("express");
const router = express.Router();

const pitchController = require("../controllers/pitch.controller");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");
const validate = require("../middleware/validate");
const {
  createPitchValidation,
  updatePitchValidation,
} = require("../validations/pitch.validation");

// LIST PITCHES
router.get("/list", pitchController.list);

// SINGLE PITCH DETAILS
router.get("/:id", pitchController.details);

// CREATE PITCH (OWNER ONLY)
router.post(
  "/create",
  auth,
  roleGuard(["owner"]),
  validate(createPitchValidation),
  pitchController.create
);

// UPDATE PITCH
router.put(
  "/update/:id",
  auth,
  roleGuard(["owner"]),
  validate(updatePitchValidation),
  pitchController.update
);

// DELETE PITCH
router.delete(
  "/delete/:id",
  auth,
  roleGuard(["owner"]),
  pitchController.remove
);

module.exports = router;
