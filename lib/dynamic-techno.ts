import "server-only";

import { dbQuery, ensureDatabaseSchema } from "@/lib/db";

export type DynamicTechnoProduct = {
  id: number;
  itemCode: string;
  brandName: string;
  productDescription: string;
  size: string;
  uom: string;
  mrp: number;
  cutPrice: number;
  images: string[];
  imageItems: { id: number; path: string }[];
};

type DynamicTechnoRow = {
  id: number;
  item_code: string;
  brand_name: string;
  product_description: string;
  size: string;
  uom: string;
  mrp: number;
  cut_price: number;
};

type DynamicTechnoImageRow = {
  id: number;
  dynamic_techno_product_id: number;
  image_path: string;
  sort_order: number;
};

export async function getAllDynamicTechnoProducts(): Promise<DynamicTechnoProduct[]> {
  await ensureDatabaseSchema();

  const [rows] = await dbQuery<DynamicTechnoRow[]>(
    `SELECT id, item_code, brand_name, product_description, size, uom, mrp, cut_price
     FROM dynamic_techno
     ORDER BY brand_name ASC, product_description ASC`
  );

  let imageRows: DynamicTechnoImageRow[] = [];
  try {
    const [imgs] = await dbQuery<DynamicTechnoImageRow[]>(
      `SELECT id, dynamic_techno_product_id, image_path, sort_order
       FROM dynamic_techno_product_images
       ORDER BY dynamic_techno_product_id ASC, sort_order ASC, id ASC`
    );
    imageRows = imgs;
  } catch {
    // table may not exist yet
  }

  const imageMap = new Map<number, { id: number; path: string }[]>();
  for (const image of imageRows) {
    const existing = imageMap.get(image.dynamic_techno_product_id) ?? [];
    existing.push({ id: image.id, path: image.image_path });
    imageMap.set(image.dynamic_techno_product_id, existing);
  }

  return rows.map((row) => ({
    id: row.id,
    itemCode: row.item_code,
    brandName: row.brand_name,
    productDescription: row.product_description,
    size: row.size,
    uom: row.uom,
    mrp: Number(row.mrp),
    cutPrice: Number(row.cut_price),
    images: (imageMap.get(row.id) ?? []).map((item) => item.path),
    imageItems: imageMap.get(row.id) ?? [],
  }));
}
