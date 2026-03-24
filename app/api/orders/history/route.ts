import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { dbQuery, ensureDatabaseSchema } from "@/lib/db";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/session";

export async function GET() {
  await ensureDatabaseSchema();

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return NextResponse.json({ ok: false, message: "Login required.", orders: [] }, { status: 401 });
  }

  const session = await getSessionUser(sessionToken);
  const email = session?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ ok: false, message: "Login required.", orders: [] }, { status: 401 });
  }

  const [orders] = await dbQuery<
    Array<{
      id: number;
      bill_no: string;
      payment_status: string;
      status: string;
      total_amount: number;
      shipping_amount: number;
      gst_amount: number;
      created_at: string;
    }>
  >(
    `SELECT id, bill_no, payment_status, status, total_amount, shipping_amount, gst_amount, created_at
     FROM orders
     WHERE email = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [email]
  );

  const orderIds = orders.map((order) => order.id);

  let itemsByOrder = new Map<number, Array<{ productName: string; quantity: number; lineTotal: number }>>();

  if (orderIds.length > 0) {
    const placeholders = orderIds.map(() => "?").join(",");
    const [items] = await dbQuery<
      Array<{
        order_id: number;
        product_name: string;
        quantity: number;
        line_total: number;
      }>
    >(
      `SELECT order_id, product_name, quantity, line_total
       FROM order_items
       WHERE order_id IN (${placeholders})
       ORDER BY id ASC`,
      orderIds
    );

    itemsByOrder = items.reduce((acc, item) => {
      const row = acc.get(item.order_id) ?? [];
      row.push({
        productName: item.product_name,
        quantity: Number(item.quantity),
        lineTotal: Number(item.line_total),
      });
      acc.set(item.order_id, row);
      return acc;
    }, new Map<number, Array<{ productName: string; quantity: number; lineTotal: number }>>());
  }

  return NextResponse.json({
    ok: true,
    orders: orders.map((order) => ({
      id: order.id,
      billNo: order.bill_no,
      paymentStatus: order.payment_status,
      orderStatus: order.status,
      totalAmount: Number(order.total_amount),
      shippingAmount: Number(order.shipping_amount),
      gstAmount: Number(order.gst_amount),
      createdAt: order.created_at,
      items: itemsByOrder.get(order.id) ?? [],
    })),
  });
}
