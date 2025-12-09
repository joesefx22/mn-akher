// app/api/owner/fields/route.js
import prisma from "@/lib/prisma";
import { verifyAuthToken } from "@/utils/auth";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = verifyAuthToken(token);

    if (!user || user.role !== "OWNER")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const fields = await prisma.field.findMany({
      where: { ownerId: user.id },
      include: { bookings: true },
    });

    return Response.json({ fields });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
