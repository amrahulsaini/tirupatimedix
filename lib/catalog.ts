import "server-only";

import { dbQuery } from "@/lib/db";

export type ProductType = "hollister" | "meril_fa" | "meril_sa" | "dynamic";

export type CatalogProduct = {
  productType: ProductType;
  productId: number;
  productKey: string;
  name: string;
  subtitle: string;
  price: number;
  mrp: number;
  imageUrl: string | null;
};

export async function getCatalogProduct(productType: ProductType, productId: number): Promise<CatalogProduct | null> {
  if (productType === "hollister") {
    const [rows] = await dbQuery<
      Array<{
        id: number;
        code: string;
        generic_name: string;
        cut_price: number;
        mrp_units: number;
        image_path: string | null;
      }>
    >(
      `SELECT h.id, h.code, h.generic_name, h.cut_price, h.mrp_units,
              (SELECT mi.image_path FROM medicine_images mi WHERE mi.medicine_id = h.id ORDER BY mi.sort_order ASC, mi.id ASC LIMIT 1) AS image_path
       FROM hollister h
       WHERE h.id = ?
       LIMIT 1`,
      [productId]
    );

    const row = rows[0];
    if (!row) return null;

    return {
      productType,
      productId: row.id,
      productKey: `${productType}:${row.id}`,
      name: `${row.generic_name} - ${row.code}`,
      subtitle: "Ostomy Care",
      price: Number(row.cut_price),
      mrp: Number(row.mrp_units),
      imageUrl: row.image_path,
    };
  }

  if (productType === "meril_fa") {
    const [rows] = await dbQuery<
      Array<{
        id: number;
        sr_no: number;
        product_name: string;
        pack_size: string;
        cut_price: number;
        mrp_units: number;
        image_path: string | null;
      }>
    >(
      `SELECT m.id, m.sr_no, m.product_name, m.pack_size, m.cut_price, m.mrp_units,
              (SELECT mpi.image_path FROM meril_product_images mpi WHERE mpi.meril_product_id = m.id ORDER BY mpi.sort_order ASC, mpi.id ASC LIMIT 1) AS image_path
       FROM meril_fully_automatic m
       WHERE m.id = ?
       LIMIT 1`,
      [productId]
    );

    const row = rows[0];
    if (!row) return null;

    return {
      productType,
      productId: row.id,
      productKey: `${productType}:${row.id}`,
      name: `${row.product_name} - ${row.sr_no}`,
      subtitle: `Pack: ${row.pack_size}`,
      price: Number(row.cut_price),
      mrp: Number(row.mrp_units),
      imageUrl: row.image_path,
    };
  }

  if (productType === "meril_sa") {
    const [rows] = await dbQuery<
      Array<{
        id: number;
        sr_no: number;
        product_name: string;
        pack_size: string;
        cut_price: number;
        mrp_units: number;
        image_path: string | null;
      }>
    >(
      `SELECT m.id, m.sr_no, m.product_name, m.pack_size, m.cut_price, m.mrp_units,
              (SELECT mpi.image_path FROM meril_semi_product_images mpi WHERE mpi.meril_semi_product_id = m.id ORDER BY mpi.sort_order ASC, mpi.id ASC LIMIT 1) AS image_path
       FROM meril_semi_automatic m
       WHERE m.id = ?
       LIMIT 1`,
      [productId]
    );

    const row = rows[0];
    if (!row) return null;

    return {
      productType,
      productId: row.id,
      productKey: `${productType}:${row.id}`,
      name: `${row.product_name} - ${row.sr_no}`,
      subtitle: `Pack: ${row.pack_size}`,
      price: Number(row.cut_price),
      mrp: Number(row.mrp_units),
      imageUrl: row.image_path,
    };
  }

  const [rows] = await dbQuery<
    Array<{
      id: number;
      item_code: string;
      product_description: string;
      brand_name: string;
      size: string;
      cut_price: number;
      mrp: number;
      image_path: string | null;
    }>
  >(
    `SELECT d.id, d.item_code, d.product_description, d.brand_name, d.size, d.cut_price, d.mrp,
            (SELECT dpi.image_path FROM dynamic_techno_product_images dpi WHERE dpi.dynamic_techno_product_id = d.id ORDER BY dpi.sort_order ASC, dpi.id ASC LIMIT 1) AS image_path
     FROM dynamic_techno d
     WHERE d.id = ?
     LIMIT 1`,
    [productId]
  );

  const row = rows[0];
  if (!row) return null;

  return {
    productType,
    productId: row.id,
    productKey: `${productType}:${row.id}`,
    name: `${row.product_description} - ${row.item_code}`,
    subtitle: `${row.brand_name} - ${row.size}`,
    price: Number(row.cut_price),
    mrp: Number(row.mrp),
    imageUrl: row.image_path,
  };
}
