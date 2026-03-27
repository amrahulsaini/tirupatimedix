"use server";

import { rm, unlink } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { dbQuery, ensureDatabaseSchema } from "@/lib/db";

const ADMIN_COOKIE = "medix_admin_session";

async function requireAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE)?.value;
  if (session !== "1") {
    throw new Error("Unauthorized");
  }
}

function toNumber(value: FormDataEntryValue | null) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function toText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function createMedicineAction(formData: FormData) {
  let status = "ok";
  try {
    await requireAdminSession();
    await ensureDatabaseSchema();

    const code = toText(formData.get("code"));
    const category = toText(formData.get("category"));
    const genericName = toText(formData.get("generic_name"));
    const packingPerBox = toNumber(formData.get("packing_per_box"));
    const mrpUnits = toNumber(formData.get("mrp_units"));
    const cutPrice = toNumber(formData.get("cut_price"));

    if (!code || !category || !genericName) {
      status = "invalid";
    } else {
      await dbQuery(
        `INSERT INTO hollister (code, category, generic_name, packing_per_box, mrp_units, cut_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [code, category, genericName, packingPerBox, mrpUnits, cutPrice]
      );
    }
  } catch (err) {
    console.error("createMedicineAction error:", err);
    status = "error";
  }

  revalidatePath("/admin");
  revalidatePath("/shop");
  redirect(`/admin?action=create-medicine&status=${status}`);
}

export async function updateMedicineAction(formData: FormData) {
  let status = "ok";
  try {
    await requireAdminSession();
    await ensureDatabaseSchema();

    const id = toNumber(formData.get("id"));
    const code = toText(formData.get("code"));
    const category = toText(formData.get("category"));
    const genericName = toText(formData.get("generic_name"));
    const packingPerBox = toNumber(formData.get("packing_per_box"));
    const mrpUnits = toNumber(formData.get("mrp_units"));
    const cutPrice = toNumber(formData.get("cut_price"));

    if (!id || !code || !category || !genericName) {
      status = "invalid";
    } else {
      await dbQuery(
        `UPDATE hollister
         SET code = ?, category = ?, generic_name = ?, packing_per_box = ?, mrp_units = ?, cut_price = ?
         WHERE id = ?`,
        [code, category, genericName, packingPerBox, mrpUnits, cutPrice, id]
      );
    }
  } catch (err) {
    console.error("updateMedicineAction error:", err);
    status = "error";
  }

  revalidatePath("/admin");
  revalidatePath("/shop");
  redirect(`/admin?action=update-medicine&status=${status}`);
}

export async function deleteMedicineAction(formData: FormData) {
  let status = "ok";
  try {
    await requireAdminSession();
    await ensureDatabaseSchema();

    const id = toNumber(formData.get("id"));
    if (!id) {
      status = "invalid";
    } else {
      await dbQuery(`DELETE FROM hollister WHERE id = ?`, [id]);
      const medicineDir = path.join(process.cwd(), "public", "uploads", "medicines", String(id));
      await rm(medicineDir, { recursive: true, force: true }).catch(() => {});
    }
  } catch (err) {
    console.error("deleteMedicineAction error:", err);
    status = "error";
  }

  revalidatePath("/admin");
  revalidatePath("/shop");
  redirect(`/admin?action=delete-medicine&status=${status}`);
}

export async function deleteMedicineImageAction(formData: FormData) {
  let status = "ok";
  try {
    await requireAdminSession();
    await ensureDatabaseSchema();

    const imageId = toNumber(formData.get("image_id"));
    const imagePath = toText(formData.get("image_path"));

    if (!imageId || !imagePath) {
      status = "invalid";
    } else {
      await dbQuery(`DELETE FROM medicine_images WHERE id = ?`, [imageId]);
      const diskPath = path.join(process.cwd(), "public", imagePath.replace(/^\//, ""));
      await unlink(diskPath).catch(() => {});
    }
  } catch (err) {
    console.error("deleteMedicineImageAction error:", err);
    status = "error";
  }

  revalidatePath("/admin");
  revalidatePath("/shop");
  redirect(`/admin?action=delete-image&status=${status}`);
}

export async function createMerilProductAction(formData: FormData) {
  let status = "ok";
  try {
    await requireAdminSession();
    await ensureDatabaseSchema();

    const srNo = toNumber(formData.get("sr_no"));
    const category = toText(formData.get("category"));
    const productName = toText(formData.get("product_name"));
    const packSize = toText(formData.get("pack_size"));
    const mrpUnits = toNumber(formData.get("mrp_units"));
    const cutPrice = toNumber(formData.get("cut_price"));
    const gst = toText(formData.get("gst"));

    if (!srNo || !category || !productName || !packSize || !gst) {
      status = "invalid";
    } else {
      await dbQuery(
        `INSERT INTO meril_fully_automatic (sr_no, category, product_name, pack_size, mrp_units, cut_price, gst)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [srNo, category, productName, packSize, mrpUnits, cutPrice, gst]
      );
    }
  } catch (err) {
    console.error("createMerilProductAction error:", err);
    status = "error";
  }

  revalidatePath("/admin");
  revalidatePath("/shop");
  redirect(`/admin?action=create-meril&status=${status}`);
}

export async function updateMerilProductAction(formData: FormData) {
  let status = "ok";
  try {
    await requireAdminSession();
    await ensureDatabaseSchema();

    const id = toNumber(formData.get("id"));
    const srNo = toNumber(formData.get("sr_no"));
    const category = toText(formData.get("category"));
    const productName = toText(formData.get("product_name"));
    const packSize = toText(formData.get("pack_size"));
    const mrpUnits = toNumber(formData.get("mrp_units"));
    const cutPrice = toNumber(formData.get("cut_price"));
    const gst = toText(formData.get("gst"));

    if (!id || !srNo || !category || !productName || !packSize || !gst) {
      status = "invalid";
    } else {
      await dbQuery(
        `UPDATE meril_fully_automatic
         SET sr_no = ?, category = ?, product_name = ?, pack_size = ?, mrp_units = ?, cut_price = ?, gst = ?
         WHERE id = ?`,
        [srNo, category, productName, packSize, mrpUnits, cutPrice, gst, id]
      );
    }
  } catch (err) {
    console.error("updateMerilProductAction error:", err);
    status = "error";
  }

  revalidatePath("/admin");
  revalidatePath("/shop");
  redirect(`/admin?action=update-meril&status=${status}`);
}

export async function deleteMerilProductAction(formData: FormData) {
  let status = "ok";
  try {
    await requireAdminSession();
    await ensureDatabaseSchema();

    const id = toNumber(formData.get("id"));
    if (!id) {
      status = "invalid";
    } else {
      await dbQuery(`DELETE FROM meril_fully_automatic WHERE id = ?`, [id]);
    }
  } catch (err) {
    console.error("deleteMerilProductAction error:", err);
    status = "error";
  }

  revalidatePath("/admin");
  revalidatePath("/shop");
  redirect(`/admin?action=delete-meril&status=${status}`);
}
