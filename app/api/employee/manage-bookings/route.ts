// app/api/employee/manage-bookings/route.js
import prisma from "@/lib/prisma";
import { verifyAuthToken } from "@/utils/auth";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = verifyAuthToken(token);
    if (!user || user.role !== "EMPLOYEE")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    // اعرض الحجوزات لليوم أو كل الحجوزات المعلقة
    const today = new Date().toISOString().slice(0, 10);
    const bookings = await prisma.booking.findMany({
      where: { date: today, status: "PENDING" },
      include: { player: true, field: true },
      orderBy: { createdAt: "asc" }
    });

    return Response.json({ todayBookings: bookings });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
