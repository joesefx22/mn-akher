// app/api/fields/create/route.js
import prisma from "@/lib/prisma";
import { verifyAuthToken } from "@/utils/auth";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = verifyAuthToken(token);

    if (!user || user.role !== "OWNER")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    if (!body.name || !body.price)
      return Response.json({ error: "Missing fields" }, { status: 400 });

    const newField = await prisma.field.create({
      data: {
        name: body.name,
        price: body.price,
        ownerId: user.id,
        image: body.image || null,
        description: body.description || "",
      },
    });

    return Response.json({ field: newField }, { status: 201 });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
