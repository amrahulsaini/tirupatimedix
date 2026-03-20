import { NextResponse } from "next/server";

const ADMIN_COOKIE = "medix_admin_session";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
