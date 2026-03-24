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

    const customerHtml = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Order Confirmed - Tirupati Medix</h2>
      <p>Hi ${order.customer_name},</p>
      <p>Your payment has been received successfully.</p>
      <p><strong>Bill No:</strong> ${order.bill_no}</p>
      <p><strong>Payment ID:</strong> ${razorpayPaymentId}</p>
      <ul>${lineItemsHtml}</ul>
      <p>Subtotal: ${formatCurrency(Number(order.subtotal))}</p>
      <p>GST (5%): ${formatCurrency(Number(order.gst_amount))}</p>
      <p>Shipping: ${formatCurrency(Number(order.shipping_amount))}</p>
      <p><strong>Total: ${formatCurrency(Number(order.total_amount))}</strong></p>
      <p>Thank you for shopping with Tirupati Medix.</p>
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
