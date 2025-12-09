// app/api/bookings/cancel/route.js
import prisma from "@/lib/prisma";
import { verifyAuthToken } from "@/utils/auth";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = verifyAuthToken(token);

    if (!user || user.role !== "PLAYER")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const { bookingId } = await req.json();

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    return Response.json({ message: "Booking cancelled", booking });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
