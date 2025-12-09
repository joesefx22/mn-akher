// app/api/bookings/accept/route.js
import prisma from "@/lib/prisma";
import { verifyAuthToken } from "@/utils/auth";
import { sendMail } from "@/utils/sendMail";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = verifyAuthToken(token);

    if (!user || !["EMPLOYEE", "OWNER"].includes(user.role))
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const { bookingId } = await req.json();

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "ACCEPTED" },
      include: {
        player: true,
        field: { include: { owner: true } },
      },
    });

    await sendMail({
      to: booking.player.email,
      subject: "تم قبول الحجز",
      html: `
        <h2>تمت الموافقة على حجزك</h2>
        <p>الملعب: ${booking.field.name}</p>
        <p>التاريخ: ${booking.date}</p>
        <p>الوقت: ${booking.time}</p>
      `,
    });

    return Response.json({ message: "Booking accepted", booking });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
