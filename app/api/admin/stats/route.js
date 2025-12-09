// app/api/admin/stats/route.js
import prisma from "@/lib/prisma";
import { verifyAuthToken } from "@/utils/auth";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = verifyAuthToken(token);

    if (!user || user.role !== "ADMIN")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const totalUsers = await prisma.user.count();
    const totalFields = await prisma.field.count();
    const totalBookings = await prisma.booking.count();

    const revenue = await prisma.payment.aggregate({
      _sum: { amount: true },
    });

    return Response.json({
      totalUsers,
      totalFields,
      totalBookings,
      revenue: revenue._sum.amount || 0,
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
