// app/api/bookings/create/route.js
import prisma from "@/lib/prisma";
import { verifyAuthToken } from "@/utils/auth";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = verifyAuthToken(token);

    if (!user || user.role !== "PLAYER")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const { fieldId, date, time } = await req.json();

    if (!fieldId || !date || !time)
      return Response.json({ error: "Missing fields" }, { status: 400 });

    const exists = await prisma.booking.findFirst({
      where: { fieldId, date, time },
    });

    if (exists)
      return Response.json({ error: "Time slot already booked" }, { status: 409 });

    const booking = await prisma.booking.create({
      data: {
        fieldId,
        playerId: user.id,
        date,
        time,
        status: "PENDING",
      },
    });

    return Response.json({ booking }, { status: 201 });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
