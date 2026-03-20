import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_COOKIE = "medix_admin_session";

function createRedirectUrl(path: string, requestUrl: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? requestUrl;
    return new URL(path, baseUrl).toString();
  } catch {
    return path;
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE);
    return NextResponse.redirect(createRedirectUrl("/admin", request.url), { status: 303 });
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.redirect(createRedirectUrl("/admin", request.url), { status: 303 });
  }
}
