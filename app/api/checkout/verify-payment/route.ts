import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { clearCart } from "@/lib/cart";
import { dbQuery, ensureDatabaseSchema } from "@/lib/db";
import { getAdminNotificationEmails, sendMail } from "@/lib/mail";
import { verifyRazorpaySignature } from "@/lib/security";
import { SESSION_COOKIE_NAME } from "@/lib/session";

function formatCurrency(value: number) {
  return `Rs. ${value.toFixed(2)}`;
}

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema();

    const body = await request.json();
    const razorpayOrderId = String(body.razorpayOrderId ?? "").trim();
    const razorpayPaymentId = String(body.razorpayPaymentId ?? "").trim();
    const razorpaySignature = String(body.razorpaySignature ?? "").trim();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ ok: false, message: "Missing payment verification payload." }, { status: 400 });
    }

    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json({ ok: false, message: "Payment signature mismatch." }, { status: 400 });
    }

    const [orderRows] = await dbQuery<
      Array<{
        id: number;
        bill_no: string;
        email: string;
        customer_name: string;
        phone: string;
        subtotal: number;
        gst_amount: number;
        shipping_amount: number;
        total_amount: number;
      }>
    >(
      `SELECT id, bill_no, email, customer_name, phone, subtotal, gst_amount, shipping_amount, total_amount
       FROM orders
       WHERE razorpay_order_id = ?
       LIMIT 1`,
      [razorpayOrderId]
    );

    const order = orderRows[0];
    if (!order) {
      return NextResponse.json({ ok: false, message: "Order record not found." }, { status: 404 });
    }

    await dbQuery(
      `UPDATE orders
       SET payment_status = 'paid', status = 'confirmed', razorpay_payment_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [razorpayPaymentId, order.id]
    );

    await dbQuery(`INSERT INTO payment_events (order_id, event_type, payload_json) VALUES (?, ?, ?)`, [
      order.id,
      "razorpay_payment_verified",
      JSON.stringify({
        razorpayOrderId,
        razorpayPaymentId,
      }),
    ]);

    const [items] = await dbQuery<Array<{ product_name: string; quantity: number; line_total: number }>>(
      `SELECT product_name, quantity, line_total FROM order_items WHERE order_id = ?`,
      [order.id]
    );

    const lineItemsHtml = items
      .map(
        (item) =>
          `<li>${item.product_name} x ${item.quantity} - ${formatCurrency(Number(item.line_total))}</li>`
      )
      .join("");

    const baseUrl = process.env.APP_BASE_URL ?? "https://tirupatimedix.com";
    const logoUrl = `${baseUrl.replace(/\/$/, "")}/main-logo.webp`;

    const customerHtml = `<div style="background:#f5f7f4;padding:24px 10px;font-family:Arial,sans-serif;color:#13201b;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #d6dfd9;border-radius:14px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,#0f4f3a,#166249);padding:14px 18px;color:#fff;display:flex;align-items:center;gap:10px;">
          <img src="${logoUrl}" alt="Tirupati Medix" width="34" height="34" style="border-radius:999px;background:#fff;padding:2px;" />
          <strong style="font-size:16px;letter-spacing:0.02em;">Order Confirmed</strong>
        </div>

        <div style="padding:20px;line-height:1.6;">
          <p style="margin:0 0 10px;">Hi <strong>${order.customer_name}</strong>, your payment has been received successfully.</p>
          <div style="background:#edf4ee;border:1px solid #d6dfd9;border-radius:10px;padding:10px 12px;">
            <p style="margin:0;"><strong>Bill No:</strong> ${order.bill_no}</p>
            <p style="margin:4px 0 0;"><strong>Payment ID:</strong> ${razorpayPaymentId}</p>
          </div>

          <h3 style="margin:16px 0 8px;font-size:16px;">Items</h3>
          <ul style="margin:0 0 12px 18px;padding:0;">${lineItemsHtml}</ul>

          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;">Subtotal</td><td style="padding:6px 0;text-align:right;">${formatCurrency(Number(order.subtotal))}</td></tr>
            <tr><td style="padding:6px 0;">GST (5%)</td><td style="padding:6px 0;text-align:right;">${formatCurrency(Number(order.gst_amount))}</td></tr>
            <tr><td style="padding:6px 0;">Shipping</td><td style="padding:6px 0;text-align:right;">${formatCurrency(Number(order.shipping_amount))}</td></tr>
            <tr><td style="padding:10px 0 0;font-weight:700;">Total</td><td style="padding:10px 0 0;text-align:right;font-weight:700;color:#0f4f3a;">${formatCurrency(Number(order.total_amount))}</td></tr>
          </table>

          <p style="margin:16px 0 0;color:#4e645b;">Thank you for shopping with Tirupati Medix.</p>
        </div>
      </div>
    </div>`;

    await sendMail({
      to: order.email,
      subject: `Order Confirmed - ${order.bill_no}`,
      html: customerHtml,
      cc: getAdminNotificationEmails(),
    });

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (sessionToken) {
      await clearCart(sessionToken);
    }

    return NextResponse.json({
      ok: true,
      message: "Payment verified and order confirmed.",
      billNo: order.bill_no,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment verification failed.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
