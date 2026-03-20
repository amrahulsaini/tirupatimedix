import { NextResponse } from "next/server";

const ADMIN_COOKIE = "medix_admin_session";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "").trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.redirect(new URL("/admin?error=config", request.url), { status: 303 });
  }

  if (password !== adminPassword) {
    return NextResponse.redirect(new URL("/admin?error=invalid", request.url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  response.cookies.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });

  return response;
}
