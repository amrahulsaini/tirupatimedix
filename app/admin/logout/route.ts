import { NextResponse } from "next/server";

const ADMIN_COOKIE = "medix_admin_session";

export async function POST(request: Request) {
  const redirectUrl = new URL("/admin", request.url);
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
