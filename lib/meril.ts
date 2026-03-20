import "server-only";

import { dbQuery, ensureDatabaseSchema } from "@/lib/db";

export type MerilProduct = {
  id: number;
  srNo: number;
  category: string;
  productName: string;
  packSize: string;
  mrpUnits: number;
  cutPrice: number;
  gst: string;
};

type MerilRow = {
  id: number;
  sr_no: number;
  category: string;
  product_name: string;
  pack_size: string;
  mrp_units: number;
  cut_price: number;
  gst: string;
};

export async function getAllMerilProducts(): Promise<MerilProduct[]> {
  await ensureDatabaseSchema();

  const [rows] = await dbQuery<MerilRow[]>(
    `SELECT id, sr_no, category, product_name, pack_size, mrp_units, cut_price, gst
     FROM meril_fully_automatic
     ORDER BY sr_no ASC, product_name ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    srNo: row.sr_no,
    category: row.category,
    productName: row.product_name,
    packSize: row.pack_size,
    mrpUnits: Number(row.mrp_units),
    cutPrice: Number(row.cut_price),
    gst: row.gst,
  }));
}
