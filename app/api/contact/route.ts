import { NextResponse } from "next/server";

import { getAdminNotificationEmails, sendMail } from "@/lib/mail";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body?.name ?? "").trim();
    const mobile = String(body?.mobile ?? "").trim();
    const message = String(body?.message ?? "").trim();

    if (!name || !mobile || !message) {
      return NextResponse.json(
        { ok: false, message: "Name, mobile number, and message are required." },
        { status: 400 }
      );
    }

    const recipients = getAdminNotificationEmails();
    if (recipients.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Admin notification emails are not configured." },
        { status: 500 }
      );
    }

    const safeName = escapeHtml(name);
    const safeMobile = escapeHtml(mobile);
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

    const html = `<div style="background:#f5f7f4;padding:20px 10px;font-family:Arial,sans-serif;color:#13201b;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #d6dfd9;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,#0f4f3a,#166249);padding:12px 16px;color:#fff;">
          <strong style="font-size:16px;letter-spacing:0.02em;">New Contact Form Message</strong>
        </div>
        <div style="padding:16px;line-height:1.55;">
          <p style="margin:0 0 10px;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin:0 0 10px;"><strong>Mobile:</strong> ${safeMobile}</p>
          <p style="margin:0;"><strong>Message:</strong><br />${safeMessage}</p>
        </div>
      </div>
    </div>`;

    await sendMail({
      to: recipients,
      subject: `Contact Form Query - ${name}`,
      html,
    });

    return NextResponse.json({ ok: true, message: "Message sent successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send message.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
