import "server-only";

import { dbQuery, ensureDatabaseSchema } from "@/lib/db";

export type MerilSemiProduct = {
  id: number;
  srNo: number;
  category: string;
  productName: string;
  packSize: string;
  mrpUnits: number;
  cutPrice: number;
  gst: string;
  images: string[];
  imageItems: { id: number; path: string }[];
};

type MerilSemiRow = {
  id: number;
  sr_no: number;
  category: string;
  product_name: string;
  pack_size: string;
  mrp_units: number;
  cut_price: number;
  gst: string;
};

type MerilSemiImageRow = {
  id: number;
  meril_semi_product_id: number;
  image_path: string;
  sort_order: number;
};

export async function getAllMerilSemiProducts(): Promise<MerilSemiProduct[]> {
  await ensureDatabaseSchema();

  const [rows] = await dbQuery<MerilSemiRow[]>(
    `SELECT id, sr_no, category, product_name, pack_size, mrp_units, cut_price, gst
     FROM meril_semi_automatic
     ORDER BY sr_no ASC, product_name ASC`
  );

  const [imageRows] = await dbQuery<MerilSemiImageRow[]>(
    `SELECT id, meril_semi_product_id, image_path, sort_order
     FROM meril_semi_product_images
     ORDER BY meril_semi_product_id ASC, sort_order ASC, id ASC`
  );

  const imageMap = new Map<number, { id: number; path: string }[]>();
  for (const image of imageRows) {
    const existing = imageMap.get(image.meril_semi_product_id) ?? [];
    existing.push({ id: image.id, path: image.image_path });
    imageMap.set(image.meril_semi_product_id, existing);
  }

  return rows.map((row) => ({
    id: row.id,
    srNo: row.sr_no,
    category: row.category,
    productName: row.product_name,
    packSize: row.pack_size,
    mrpUnits: Number(row.mrp_units),
    cutPrice: Number(row.cut_price),
    gst: row.gst,
    images: (imageMap.get(row.id) ?? []).map((item) => item.path),
    imageItems: imageMap.get(row.id) ?? [],
  }));
}
