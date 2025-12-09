// player.controller.js
// ======================================
// Player Controller (Production Ready)
// Handles Request → Validation → Service → Response

const playerService = require("../services/playerService");
const { asyncWrapper } = require("../utils/asyncWrapper");

// GET /player/profile
exports.getProfile = asyncWrapper(async (req, res) => {
  const playerId = req.user.id;

  const data = await playerService.getPlayerProfile(playerId);

  return res.status(200).json({
    status: "success",
    message: "Player profile fetched successfully",
    data,
  });
});

// PUT /player/update
exports.updatePlayer = asyncWrapper(async (req, res) => {
  const playerId = req.user.id;
  const body = req.body;

  const data = await playerService.updatePlayer(playerId, body);

  return res.status(200).json({
    status: "success",
    message: "Player updated successfully",
    data,
  });
});

// DELETE /player/delete
exports.deletePlayer = asyncWrapper(async (req, res) => {
  const playerId = req.user.id;

  const data = await playerService.deletePlayer(playerId);

  return res.status(200).json({
    status: "success",
    message: "Account deleted",
    data,
  });
});

// GET /player/bookings
exports.getBookings = asyncWrapper(async (req, res) => {
  const playerId = req.user.id;

  const data = await playerService.getPlayerBookings(playerId);

  return res.status(200).json({
    status: "success",
    message: "Bookings loaded",
    total: data.length,
    data,
  });
});
