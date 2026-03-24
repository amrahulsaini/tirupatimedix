import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCart, getCartPricing } from "@/lib/cart";
import { ensureDatabaseSchema, dbQuery } from "@/lib/db";
import { getRazorpayClient } from "@/lib/razorpay";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/session";

function createBillNo() {
  return `TM${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
}

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionToken) {
      return NextResponse.json({ ok: false, message: "Login required before checkout." }, { status: 401 });
    }

    const sessionUser = await getSessionUser(sessionToken);
    if (!sessionUser?.email) {
      return NextResponse.json({ ok: false, message: "Please verify your email before payment." }, { status: 401 });
    }

    const body = await request.json();
    const customerName = String(body.customerName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const addressLine = String(body.addressLine ?? "").trim();
    const city = String(body.city ?? "").trim();
    const state = String(body.state ?? "").trim();
    const pincode = String(body.pincode ?? "").trim();
    const notes = String(body.notes ?? "").trim();

    if (!customerName || !phone || !addressLine || !city || !state || !pincode) {
      return NextResponse.json({ ok: false, message: "Please complete all required address fields." }, { status: 400 });
    }

    const cart = await getCart(sessionToken);
    if (cart.items.length === 0) {
      return NextResponse.json({ ok: false, message: "Cart is empty." }, { status: 400 });
    }

    const pricing = getCartPricing(cart.subtotal, pincode);
    const billNo = createBillNo();

    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(pricing.total * 100),
      currency: "INR",
      receipt: billNo,
      notes: {
        billNo,
        email: sessionUser.email,
      },
    });

    await dbQuery(
      `INSERT INTO orders
      (bill_no, razorpay_order_id, status, payment_status, user_id, email, phone, customer_name, address_line, city, state, pincode, notes, subtotal, gst_percent, gst_amount, shipping_amount, total_amount, is_udaipur_shipping, shipping_threshold_applied)
      VALUES (?, ?, 'pending', 'created', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        billNo,
        razorpayOrder.id,
        sessionUser.userId,
        sessionUser.email,
        phone,
        customerName,
        addressLine,
        city,
        state,
        pincode,
        notes || null,
        pricing.subtotal,
        pricing.gstPercent,
        pricing.gstAmount,
        pricing.shippingAmount,
        pricing.total,
        pricing.isUdaipurPincode ? 1 : 0,
        pricing.freeShippingThreshold,
      ]
    );

    const [orderRows] = await dbQuery<Array<{ id: number }>>(
      `SELECT id FROM orders WHERE razorpay_order_id = ? LIMIT 1`,
      [razorpayOrder.id]
    );

    const orderId = orderRows[0]?.id;
    if (!orderId) {
      return NextResponse.json({ ok: false, message: "Order creation failed." }, { status: 500 });
    }

    for (const item of cart.items) {
      await dbQuery(
        `INSERT INTO order_items
        (order_id, product_type, product_id, product_name, product_subtitle, image_url, unit_price, mrp_price, quantity, line_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productType,
          item.productId,
          item.productName,
          item.productSubtitle,
          item.imageUrl,
          item.unitPrice,
          item.mrpPrice,
          item.quantity,
          item.lineTotal,
        ]
      );
    }

    await dbQuery(`INSERT INTO payment_events (order_id, event_type, payload_json) VALUES (?, ?, ?)`, [
      orderId,
      "razorpay_order_created",
      JSON.stringify(razorpayOrder),
    ]);

    return NextResponse.json({
      ok: true,
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderSummary: {
        billNo,
        subtotal: pricing.subtotal,
        gstAmount: pricing.gstAmount,
        shippingAmount: pricing.shippingAmount,
        total: pricing.total,
      },
      customer: {
        name: customerName,
        email: sessionUser.email,
        phone,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
