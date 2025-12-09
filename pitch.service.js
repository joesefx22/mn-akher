// services/pitch.service.js
// ==============================================================

const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

class PitchService {
  async listPitches(filters = {}) {
    const { areaId, ownerId, minPrice, maxPrice } = filters;

    const where = {};

    if (areaId) where.areaId = areaId;
    if (ownerId) where.ownerId = ownerId;
    if (minPrice) where.pricePerHour = { gte: Number(minPrice) };
    if (maxPrice) where.pricePerHour = { lte: Number(maxPrice) };

    return await prisma.pitch.findMany({
      where,
      include: { owner: true, area: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPitch(id) {
    const pitch = await prisma.pitch.findUnique({
      where: { id: Number(id) },
      include: { owner: true, area: true },
    });

    if (!pitch) throw new AppError("Pitch not found", 404);

    return pitch;
  }

  async createPitch(ownerId, data) {
    return await prisma.pitch.create({
      data: {
        ...data,
        ownerId,
      },
    });
  }

  async updatePitch(id, ownerId, data) {
    const pitch = await prisma.pitch.findUnique({
      where: { id: Number(id) },
    });

    if (!pitch) throw new AppError("Pitch not found", 404);
    if (pitch.ownerId !== ownerId)
      throw new AppError("Unauthorized to update this pitch", 403);

    return await prisma.pitch.update({
      where: { id: Number(id) },
      data,
    });
  }

  async deletePitch(id, ownerId) {
    const pitch = await prisma.pitch.findUnique({
      where: { id: Number(id) },
    });

    if (!pitch) throw new AppError("Pitch not found", 404);
    if (pitch.ownerId !== ownerId)
      throw new AppError("Unauthorized to delete", 403);

    return await prisma.pitch.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = new PitchService();
