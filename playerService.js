// playerService.js
// ===============================
// Player Service (Production Ready)
// Handles: fetch profile, update data, delete account, list bookings
// Integrations: Prisma, Zod validation, Error handler, Role guard

const prisma = require("../prisma/prismaClient");
const { AppError } = require("../utils/AppError");
const { playerSchema, updatePlayerSchema } = require("../validations/player.validation");

// Get player profile
exports.getPlayerProfile = async (playerId) => {
  if (!playerId) throw new AppError("Missing player ID", 400);

  const player = await prisma.user.findUnique({
    where: { id: playerId },
    include: { bookings: true },
  });

  if (!player) throw new AppError("Player not found", 404);
  if (player.role !== "PLAYER") throw new AppError("Access denied", 403);

  return player;
};

// Update player info
exports.updatePlayer = async (playerId, body) => {
  const parsed = updatePlayerSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const updated = await prisma.user.update({
    where: { id: playerId },
    data: parsed.data,
  });

  return updated;
};

// Delete player account
exports.deletePlayer = async (playerId) => {
  const player = await prisma.user.findUnique({ where: { id: playerId } });
  if (!player) throw new AppError("Account not found", 404);

  await prisma.user.delete({ where: { id: playerId } });

  return { message: "Player account deleted" };
};

// List all bookings of a player
exports.getPlayerBookings = async (playerId) => {
  if (!playerId) throw new AppError("Missing player ID", 400);

  const bookings = await prisma.booking.findMany({
    where: { playerId },
    include: {
      pitch: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings;
};
