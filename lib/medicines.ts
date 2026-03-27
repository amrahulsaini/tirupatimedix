import "server-only";

import { dbQuery, ensureDatabaseSchema } from "@/lib/db";

export type Medicine = {
  id: number;
  code: string;
  category: string;
  genericName: string;
  packingPerBox: number;
  mrpUnits: number;
  cutPrice: number;
  images: string[];
  imageItems: { id: number; path: string }[];
};

type MedicineRow = {
  id: number;
  code: string;
  category: string;
  generic_name: string;
  packing_per_box: number;
  mrp_units: number;
  cut_price: number;
};

type ImageRow = {
  id: number;
  medicine_id: number;
  image_path: string;
  sort_order: number;
};

function mapMedicine(
  row: MedicineRow,
  imageItems: { id: number; path: string }[]
): Medicine {
  return {
    id: row.id,
    code: row.code,
    category: row.category,
    genericName: row.generic_name,
    packingPerBox: row.packing_per_box,
    mrpUnits: Number(row.mrp_units),
    cutPrice: Number(row.cut_price),
    images: imageItems.map((item) => item.path),
    imageItems,
  };
}

export async function getAllMedicines() {
  await ensureDatabaseSchema();

  const [medicineRows] = await dbQuery<MedicineRow[]>(
    `SELECT id, code, category, generic_name, packing_per_box, mrp_units, cut_price
      FROM hollister
     ORDER BY category ASC, generic_name ASC`
  );

  const [imageRows] = await dbQuery<ImageRow[]>(
    `SELECT id, medicine_id, image_path, sort_order
     FROM medicine_images
     ORDER BY medicine_id ASC, sort_order ASC, id ASC`
  );

  const imageMap = new Map<number, { id: number; path: string }[]>();
  for (const image of imageRows) {
    const existing = imageMap.get(image.medicine_id) ?? [];
    existing.push({ id: image.id, path: image.image_path });
    imageMap.set(image.medicine_id, existing);
  }

  return medicineRows.map((row) => mapMedicine(row, imageMap.get(row.id) ?? []));
}

export async function getMedicineCategories() {
  const medicines = await getAllMedicines();
  return [...new Set(medicines.map((item) => item.category))];
}
