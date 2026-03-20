import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_COOKIE = "medix_admin_session";

function createRedirectUrl(path: string, requestUrlStr: string) {
  try {
    const requestUrl = new URL(requestUrlStr);
    
    // If we're behind a proxy that forwards traffic to localhost:3000 but the browser is on a public domain,
    // request.url will often be "http://localhost:3000...".
    // We can usually just return the relative path to let Next.js + the proxy resolve it to the client.
    // However, NextResponse.redirect *requires* an absolute URL unless you pass a relative string directly in Next 15+ sometimes,
    // but a safe cross-version middleground is returning an absolute URL matching the incoming request origin,
    // OR passing the path directly if it throws.
    return new URL(path, requestUrl).toString();
  } catch {
    return path;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const password = String(formData.get("password") ?? "").trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Use absolute URL from environment if passed, else fallback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? request.url;

    if (!adminPassword) {
      return NextResponse.redirect(createRedirectUrl("/admin?action=login&status=config", baseUrl), { status: 303 });
    }

    if (password !== adminPassword) {
      return NextResponse.redirect(createRedirectUrl("/admin?action=login&status=invalid", baseUrl), { status: 303 });
    }

    const cookieStore = await cookies();
    
    // Check if the request is actually coming in over HTTPS through proxy or directly
    const isHttps = request.url.startsWith("https://") || request.headers.get("x-forwarded-proto") === "https";

    cookieStore.set(ADMIN_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      maxAge: 60 * 60 * 12,
      path: "/",
    });

    return NextResponse.redirect(createRedirectUrl("/admin", baseUrl), { status: 303 });
  } catch (error) {
    console.error("Login Error:", error);
    const fallbackUrl = process.env.NEXT_PUBLIC_BASE_URL ?? request.url;
    return NextResponse.redirect(createRedirectUrl("/admin?action=login&status=error", fallbackUrl), { status: 303 });
  }
}
