import "server-only";

import { dbQuery } from "@/lib/db";
import { getPricingBreakup } from "@/lib/commerce";

export type CartItem = {
  id: number;
  productType: string;
  productId: number;
  productKey: string;
  productName: string;
  productSubtitle: string;
  imageUrl: string | null;
  unitPrice: number;
  mrpPrice: number;
  quantity: number;
  lineTotal: number;
};

async function getOrCreateCart(sessionToken: string) {
  const [rows] = await dbQuery<Array<{ id: number }>>(
    `SELECT id FROM carts WHERE session_token = ? LIMIT 1`,
    [sessionToken]
  );

  if (rows[0]) {
    return rows[0].id;
  }

  await dbQuery(`INSERT INTO carts (session_token) VALUES (?)`, [sessionToken]);
  const [createdRows] = await dbQuery<Array<{ id: number }>>(
    `SELECT id FROM carts WHERE session_token = ? LIMIT 1`,
    [sessionToken]
  );

  return createdRows[0].id;
}

export async function addItemToCart(params: {
  sessionToken: string;
  productType: string;
  productId: number;
  productKey: string;
  productName: string;
  productSubtitle: string;
  imageUrl: string | null;
  unitPrice: number;
  mrpPrice: number;
  quantity?: number;
}) {
  const cartId = await getOrCreateCart(params.sessionToken);
  const quantity = Math.max(1, params.quantity ?? 1);

  await dbQuery(
    `INSERT INTO cart_items
      (cart_id, product_type, product_id, product_key, product_name, product_subtitle, image_url, unit_price, mrp_price, quantity)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      quantity = quantity + VALUES(quantity),
      unit_price = VALUES(unit_price),
      mrp_price = VALUES(mrp_price),
      product_name = VALUES(product_name),
      product_subtitle = VALUES(product_subtitle),
      image_url = VALUES(image_url),
      updated_at = NOW()`,
    [
      cartId,
      params.productType,
      params.productId,
      params.productKey,
      params.productName,
      params.productSubtitle,
      params.imageUrl,
      params.unitPrice,
      params.mrpPrice,
      quantity,
    ]
  );
}

export async function updateCartItemQuantity(sessionToken: string, itemId: number, quantity: number) {
  const cartId = await getOrCreateCart(sessionToken);

  if (quantity <= 0) {
    await dbQuery(`DELETE FROM cart_items WHERE id = ? AND cart_id = ?`, [itemId, cartId]);
    return;
  }

  await dbQuery(`UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ? AND cart_id = ?`, [
    quantity,
    itemId,
    cartId,
  ]);
}

export async function removeCartItem(sessionToken: string, itemId: number) {
  const cartId = await getOrCreateCart(sessionToken);
  await dbQuery(`DELETE FROM cart_items WHERE id = ? AND cart_id = ?`, [itemId, cartId]);
}

export async function clearCart(sessionToken: string) {
  const cartId = await getOrCreateCart(sessionToken);
  await dbQuery(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);
}

export async function getCart(sessionToken: string) {
  const cartId = await getOrCreateCart(sessionToken);
  const [items] = await dbQuery<
    Array<{
      id: number;
      product_type: string;
      product_id: number;
      product_key: string;
      product_name: string;
      product_subtitle: string;
      image_url: string | null;
      unit_price: number;
      mrp_price: number;
      quantity: number;
    }>
  >(
    `SELECT id, product_type, product_id, product_key, product_name, product_subtitle, image_url, unit_price, mrp_price, quantity
     FROM cart_items
     WHERE cart_id = ?
     ORDER BY id DESC`,
    [cartId]
  );

  const mappedItems: CartItem[] = items.map((item) => ({
    id: item.id,
    productType: item.product_type,
    productId: item.product_id,
    productKey: item.product_key,
    productName: item.product_name,
    productSubtitle: item.product_subtitle,
    imageUrl: item.image_url,
    unitPrice: Number(item.unit_price),
    mrpPrice: Number(item.mrp_price),
    quantity: Number(item.quantity),
    lineTotal: Number((Number(item.unit_price) * Number(item.quantity)).toFixed(2)),
  }));

  const subtotal = mappedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    cartId,
    items: mappedItems,
    subtotal: Number(subtotal.toFixed(2)),
  };
}

export function getCartPricing(subtotal: number, pincode: string) {
  return getPricingBreakup(subtotal, pincode);
}
