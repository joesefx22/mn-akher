// app/api/admin/manage-users/route.js
import prisma from "@/lib/prisma";
import { verifyAuthToken } from "@/utils/auth";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = verifyAuthToken(token);

    if (!user || user.role !== "ADMIN")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const users = await prisma.user.findMany({
      include: { bookings: true, fields: true },
    });

    return Response.json({ users });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const admin = verifyAuthToken(token);

    if (!admin || admin.role !== "ADMIN")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const { id, data } = await req.json();

    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    return Response.json({ updated });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const admin = verifyAuthToken(token);

    if (!admin || admin.role !== "ADMIN")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await req.json();

    await prisma.user.delete({ where: { id } });

    return Response.json({ message: "User deleted" });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
