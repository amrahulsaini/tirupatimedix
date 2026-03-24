import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCart, getCartPricing } from "@/lib/cart";
import { ensureDatabaseSchema } from "@/lib/db";
import { SESSION_COOKIE_NAME, getOrCreateSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  await ensureDatabaseSchema();

  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = existing
    ? { token: existing, shouldSetCookie: false }
    : await getOrCreateSessionToken();

  const body = await request.json();
  const pincode = String(body.pincode ?? "").trim();

  const cart = await getCart(session.token);
  const pricing = getCartPricing(cart.subtotal, pincode);

  const response = NextResponse.json({
    ok: true,
    subtotal: cart.subtotal,
    pricing,
    shippingMessage: pricing.isUdaipurPincode
      ? "Udaipur pincode detected. Free shipping above Rs. 1000."
      : "Free shipping above Rs. 2000.",
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
}
