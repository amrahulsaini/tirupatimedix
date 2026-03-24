import "server-only";

import nodemailer from "nodemailer";

type SendMailInput = {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string[];
};

function getTransporter() {
  const host = process.env.EMAIL_HOST ?? process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    requireTLS: port !== 25,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendMail(input: SendMailInput) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;

  if (!transporter || !from) {
    throw new Error("SMTP is not configured. Set EMAIL_HOST/SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.");
  }

  await transporter.sendMail({
    from,
    to: input.to,
    cc: input.cc,
    subject: input.subject,
    html: input.html,
  });
}

export function getAdminNotificationEmails() {
  const raw = process.env.ADMIN_NOTIFICATION_EMAILS ?? "care@tirupatimedix.com,tirupatimediz@gmail.com";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}
