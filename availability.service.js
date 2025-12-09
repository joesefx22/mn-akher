// services/availability.service.js
// =======================================================================

const prisma = require("../lib/prisma");

class AvailabilityService {
  async isSlotAvailable(pitchId, date, startTime, endTime) {
    const conflict = await prisma.booking.findFirst({
      where: {
        pitchId: Number(pitchId),
        date,
        status: "confirmed",
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
        ],
      },
    });

    return !conflict;
  }
}

module.exports = new AvailabilityService();
