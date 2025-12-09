// routes/player.routes.js
// =========================================
// Player Routes (Production Ready)

const express = require("express");
const router = express.Router();

const playerController = require("../controllers/player.controller");

// Middlewares
const authMiddleware = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

// Validations
const {
  updatePlayerValidation,
} = require("../validations/player.validation");

// Validation Middleware
const validate = require("../middleware/validate");

// Rate Limiter (اختياري)
const rateLimit = require("../middleware/rateLimit");

// =========================================
// Routes Start
// =========================================

// 🟢 Get player profile
router.get(
  "/profile",
  authMiddleware,               // يجب تسجيل الدخول
  roleGuard(["player"]),        // لازم يكون لاعب
  playerController.getProfile
);

// 🟡 Update player info
router.put(
  "/update",
  rateLimit(10, 60),            // 10 Requests / minute
  authMiddleware,
  roleGuard(["player"]),
  validate(updatePlayerValidation),
  playerController.updatePlayer
);

// 🔴 Delete account
router.delete(
  "/delete",
  authMiddleware,
  roleGuard(["player"]),
  playerController.deletePlayer
);

// 📅 Get bookings
router.get(
  "/bookings",
  authMiddleware,
  roleGuard(["player"]),
  playerController.getBookings
);

module.exports = router;
