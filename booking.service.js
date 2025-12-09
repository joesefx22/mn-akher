// services/booking.service.js
// =======================================================================

const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const availabilityService = require("./availability.service");

class BookingService {
  async listBookings(userId, role) {
    if (role === "player") {
      return await prisma.booking.findMany({
        where: { userId },
        include: { pitch: true },
        orderBy: { date: "desc" },
      });
    }

    if (role === "owner") {
      return await prisma.booking.findMany({
        where: { pitch: { ownerId: userId } },
        include: { pitch: true, user: true },
        orderBy: { date: "desc" },
      });
    }

    return await prisma.booking.findMany({
      include: { pitch: true, user: true },
    });
  }

  async getBooking(id) {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: { pitch: true, user: true },
    });

    if (!booking) throw new AppError("Booking not found", 404);
    return booking;
  }

  async createBooking(userId, data) {
    const { pitchId, date, startTime, endTime } = data;

    // Check availability
    const isFree = await availabilityService.isSlotAvailable(
      pitchId,
      date,
      startTime,
      endTime
    );

    if (!isFree) throw new AppError("Slot not available", 409);

    return await prisma.booking.create({
      data: {
        userId,
        pitchId,
        date,
        startTime,
        endTime,
        status: "confirmed",
      },
    });
  }

  async cancelBooking(id, userId, role) {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
    });

    if (!booking) throw new AppError("Booking not found", 404);

    if (role === "player" && booking.userId !== userId)
      throw new AppError("Not allowed to cancel this booking", 403);

    return await prisma.booking.update({
      where: { id: Number(id) },
      data: { status: "cancelled" },
    });
  }
}

module.exports = new BookingService();
