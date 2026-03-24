import { NextResponse } from "next/server";

import { normalizeEmail, verifyOtp } from "@/lib/auth";
import { ensureDatabaseSchema } from "@/lib/db";
import { SESSION_COOKIE_NAME, attachSessionToUser, getOrCreateSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema();
    const body = await request.json();
    const email = normalizeEmail(String(body.email ?? ""));
    const otp = String(body.otp ?? "").trim();

    if (!email || !otp) {
      return NextResponse.json({ ok: false, message: "Email and OTP are required." }, { status: 400 });
    }

    const verification = await verifyOtp(email, otp);
    if (!verification.success || !verification.user) {
      return NextResponse.json({ ok: false, message: verification.message }, { status: 400 });
    }

    const session = await getOrCreateSessionToken();
    await attachSessionToUser(session.token, verification.user.id, verification.user.email);

    const response = NextResponse.json({
      ok: true,
      user: {
        id: verification.user.id,
        email: verification.user.email,
      },
      message: "Email verified successfully.",
    });

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
    const message = error instanceof Error ? error.message : "OTP verification failed.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
