// utils/sendMail.js
import nodemailer from "nodemailer";

export async function sendMail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"احجزلي" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
}
