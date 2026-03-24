import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { addItemToCart, clearCart, getCart, getCartPricing, removeCartItem, updateCartItemQuantity } from "@/lib/cart";
import { getCatalogProduct, type ProductType } from "@/lib/catalog";
import { ensureDatabaseSchema } from "@/lib/db";
import { SESSION_COOKIE_NAME, getOrCreateSessionToken } from "@/lib/session";

const PRODUCT_TYPES: ProductType[] = ["hollister", "meril_fa", "meril_sa", "dynamic"];

function isProductType(value: string): value is ProductType {
  return PRODUCT_TYPES.includes(value as ProductType);
}

async function withSessionCookie(response: NextResponse, shouldSetCookie: boolean, token: string) {
  if (shouldSetCookie) {
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

export async function GET(request: Request) {
  await ensureDatabaseSchema();

  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = existing
    ? { token: existing, shouldSetCookie: false }
    : await getOrCreateSessionToken();

  const url = new URL(request.url);
  const pincode = (url.searchParams.get("pincode") ?? "").trim();

  const cart = await getCart(session.token);
  const pricing = getCartPricing(cart.subtotal, pincode);

  return withSessionCookie(
    NextResponse.json({
      ok: true,
      cart,
      pricing,
      shippingNote: pricing.isUdaipurPincode
        ? "Free shipping above Rs. 1000 for selected Udaipur pincodes."
        : "Free shipping above Rs. 2000.",
    }),
    session.shouldSetCookie,
    session.token
  );
}

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema();

    const cookieStore = await cookies();
    const existing = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const session = existing
      ? { token: existing, shouldSetCookie: false }
      : await getOrCreateSessionToken();

    const body = await request.json();
    const action = String(body.action ?? "");

    if (action === "add" || action === "buy_now") {
      const productType = String(body.productType ?? "");
      const productId = Number(body.productId ?? 0);
      const quantity = Number(body.quantity ?? 1);

      if (!isProductType(productType) || !productId) {
        return NextResponse.json({ ok: false, message: "Invalid product data." }, { status: 400 });
      }

      const product = await getCatalogProduct(productType, productId);
      if (!product) {
        return NextResponse.json({ ok: false, message: "Product not found." }, { status: 404 });
      }

      if (action === "buy_now") {
        await clearCart(session.token);
      }

      await addItemToCart({
        sessionToken: session.token,
        productType: product.productType,
        productId: product.productId,
        productKey: product.productKey,
        productName: product.name,
        productSubtitle: product.subtitle,
        imageUrl: product.imageUrl,
        unitPrice: product.price,
        mrpPrice: product.mrp,
        quantity,
      });
    } else if (action === "update") {
      const itemId = Number(body.itemId ?? 0);
      const quantity = Number(body.quantity ?? 0);
      if (!itemId) {
        return NextResponse.json({ ok: false, message: "Invalid cart item." }, { status: 400 });
      }
      await updateCartItemQuantity(session.token, itemId, quantity);
    } else if (action === "remove") {
      const itemId = Number(body.itemId ?? 0);
      if (!itemId) {
        return NextResponse.json({ ok: false, message: "Invalid cart item." }, { status: 400 });
      }
      await removeCartItem(session.token, itemId);
    } else if (action === "clear") {
      await clearCart(session.token);
    } else {
      return NextResponse.json({ ok: false, message: "Unsupported cart action." }, { status: 400 });
    }

    const cart = await getCart(session.token);
    const response = NextResponse.json({ ok: true, cart });
    return withSessionCookie(response, session.shouldSetCookie, session.token);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cart update failed.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
