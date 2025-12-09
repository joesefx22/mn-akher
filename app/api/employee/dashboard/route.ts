// app/api/employee/dashboard/route.js
import prisma from "@/lib/prisma";
import { verifyAuthToken } from "@/utils/auth";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = verifyAuthToken(token);

    if (!user || user.role !== "EMPLOYEE")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const pending = await prisma.booking.count({
      where: { status: "PENDING" },
    });

    const todayBookings = await prisma.booking.findMany({
      where: { date: new Date().toISOString().slice(0, 10) },
      include: { player: true, field: true },
    });

    return Response.json({ pending, todayBookings });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
