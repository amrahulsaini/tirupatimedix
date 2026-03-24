import { NextResponse } from "next/server";

import { createAndSendOtp, normalizeEmail } from "@/lib/auth";
import { ensureDatabaseSchema } from "@/lib/db";
import { SESSION_COOKIE_NAME, getOrCreateSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema();
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
    }

    await createAndSendOtp(email);

    const session = await getOrCreateSessionToken();
    const response = NextResponse.json({ ok: true, message: "OTP sent successfully." });

    if (session.shouldSetCookie) {
      response.cookies.set(SESSION_COOKIE_NAME, session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send OTP.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
