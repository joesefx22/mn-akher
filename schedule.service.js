// services/schedule.service.js
// ==============================================================

class ScheduleService {
  generateDailySlots(startHour = 8, endHour = 23, slotDuration = 60) {
    const slots = [];

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        start: `${hour}:00`,
        end: `${hour + 1}:00`,
      });
    }

    return slots;
  }

  generatePitchAvailability(pitch, bookings = []) {
    const today = new Date().toISOString().split("T")[0];

    const slots = this.generateDailySlots(8, 23);

    const takenSlots = bookings.map((b) => b.startTime);

    return slots.map((slot) => ({
      ...slot,
      isBooked: takenSlots.includes(`${today} ${slot.start}`),
    }));
  }
}

module.exports = new ScheduleService();
