"use server";

import { mkdir, rm, unlink, writeFile } from "node:fs/promises";
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

function sanitizeFileName(originalName: string) {
  const base = originalName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return base.length > 0 ? base : `image-${Date.now()}.jpg`;
}

function isNextRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export async function createMedicineAction(formData: FormData) {
  try {
    await requireAdminSession();
    await ensureDatabaseSchema();

    const code = toText(formData.get("code"));
    const category = toText(formData.get("category"));
    const genericName = toText(formData.get("generic_name"));
    const packingPerBox = toNumber(formData.get("packing_per_box"));
    const dpUnits = toNumber(formData.get("dp_units"));
    const mrpUnits = toNumber(formData.get("mrp_units"));
    const cutPrice = toNumber(formData.get("cut_price"));

    if (!code || !category || !genericName) {
      redirect("/admin?action=create-medicine&status=invalid");
    }

    await dbQuery(
      `INSERT INTO hollister (code, category, generic_name, packing_per_box, dp_units, mrp_units, cut_price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, category, genericName, packingPerBox, dpUnits, mrpUnits, cutPrice]
    );

    revalidatePath("/admin");
    revalidatePath("/shop");
    redirect("/admin?action=create-medicine&status=ok");
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }
    redirect("/admin?action=create-medicine&status=error");
  }
}

export async function updateMedicineAction(formData: FormData) {
  try {
    await requireAdminSession();
    await ensureDatabaseSchema();

    const id = toNumber(formData.get("id"));
    const code = toText(formData.get("code"));
    const category = toText(formData.get("category"));
    const genericName = toText(formData.get("generic_name"));
    const packingPerBox = toNumber(formData.get("packing_per_box"));
    const dpUnits = toNumber(formData.get("dp_units"));
    const mrpUnits = toNumber(formData.get("mrp_units"));
    const cutPrice = toNumber(formData.get("cut_price"));

    if (!id || !code || !category || !genericName) {
      redirect("/admin?action=update-medicine&status=invalid");
    }

    await dbQuery(
      `UPDATE hollister
       SET code = ?, category = ?, generic_name = ?, packing_per_box = ?, dp_units = ?, mrp_units = ?, cut_price = ?
       WHERE id = ?`,
      [code, category, genericName, packingPerBox, dpUnits, mrpUnits, cutPrice, id]
    );

    revalidatePath("/admin");
    revalidatePath("/shop");
    redirect("/admin?action=update-medicine&status=ok");
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }
    redirect("/admin?action=update-medicine&status=error");
  }
}

export async function deleteMedicineAction(formData: FormData) {
  try {
    await requireAdminSession();
    await ensureDatabaseSchema();

    const id = toNumber(formData.get("id"));
    if (!id) {
      redirect("/admin?action=delete-medicine&status=invalid");
    }

    await dbQuery(`DELETE FROM hollister WHERE id = ?`, [id]);

    const medicineDir = path.join(process.cwd(), "public", "uploads", "medicines", String(id));
    await rm(medicineDir, { recursive: true, force: true });

    revalidatePath("/admin");
    revalidatePath("/shop");
    redirect("/admin?action=delete-medicine&status=ok");
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }
    redirect("/admin?action=delete-medicine&status=error");
  }
}

export async function uploadMedicineImagesAction(formData: FormData) {
  await requireAdminSession();
  await ensureDatabaseSchema();

  const medicineId = toNumber(formData.get("medicine_id"));
  if (!medicineId) {
    throw new Error("Medicine id is required for image upload.");
  }

  const files = formData.getAll("images").filter((entry): entry is File => entry instanceof File);
  const validFiles = files.filter((file) => file.size > 0);

  if (validFiles.length === 0) {
    return;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "medicines", String(medicineId));
  await mkdir(uploadDir, { recursive: true });

  const [orderRows] = await dbQuery<{ maxOrder: number | null }[]>(
    `SELECT MAX(sort_order) AS maxOrder FROM medicine_images WHERE medicine_id = ?`,
    [medicineId]
  );
  let sortOrder = orderRows[0]?.maxOrder ?? 0;

  for (const file of validFiles) {
    sortOrder += 1;
    const ext = path.extname(file.name) || ".jpg";
    const safeName = sanitizeFileName(path.basename(file.name, ext));
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}${ext}`;
    const diskPath = path.join(uploadDir, fileName);
    const publicPath = `/uploads/medicines/${medicineId}/${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(diskPath, buffer);

    await dbQuery(
      `INSERT INTO medicine_images (medicine_id, image_path, sort_order) VALUES (?, ?, ?)`,
      [medicineId, publicPath, sortOrder]
    );
  }

  revalidatePath("/admin");
  revalidatePath("/shop");
}

export async function deleteMedicineImageAction(formData: FormData) {
  try {
    await requireAdminSession();
    await ensureDatabaseSchema();

    const imageId = toNumber(formData.get("image_id"));
    const imagePath = toText(formData.get("image_path"));

    if (!imageId || !imagePath) {
      redirect("/admin?action=delete-image&status=invalid");
    }

    await dbQuery(`DELETE FROM medicine_images WHERE id = ?`, [imageId]);

    const diskPath = path.join(process.cwd(), "public", imagePath.replace(/^\//, ""));
    await unlink(diskPath).catch(() => {
      // Ignore file deletion errors if file was already removed.
    });

    revalidatePath("/admin");
    revalidatePath("/shop");
    redirect("/admin?action=delete-image&status=ok");
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }
    redirect("/admin?action=delete-image&status=error");
  }
}

export async function createMerilProductAction(formData: FormData) {
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
      redirect("/admin?action=create-meril&status=invalid");
    }

    await dbQuery(
      `INSERT INTO meril_fully_automatic (sr_no, category, product_name, pack_size, mrp_units, cut_price, gst)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [srNo, category, productName, packSize, mrpUnits, cutPrice, gst]
    );

    revalidatePath("/admin");
    revalidatePath("/shop");
    redirect("/admin?action=create-meril&status=ok");
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }
    redirect("/admin?action=create-meril&status=error");
  }
}

export async function updateMerilProductAction(formData: FormData) {
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
      redirect("/admin?action=update-meril&status=invalid");
    }

    await dbQuery(
      `UPDATE meril_fully_automatic
       SET sr_no = ?, category = ?, product_name = ?, pack_size = ?, mrp_units = ?, cut_price = ?, gst = ?
       WHERE id = ?`,
      [srNo, category, productName, packSize, mrpUnits, cutPrice, gst, id]
    );

    revalidatePath("/admin");
    revalidatePath("/shop");
    redirect("/admin?action=update-meril&status=ok");
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }
    redirect("/admin?action=update-meril&status=error");
  }
}

export async function deleteMerilProductAction(formData: FormData) {
  try {
    await requireAdminSession();
    await ensureDatabaseSchema();

    const id = toNumber(formData.get("id"));
    if (!id) {
      redirect("/admin?action=delete-meril&status=invalid");
    }

    await dbQuery(`DELETE FROM meril_fully_automatic WHERE id = ?`, [id]);

    revalidatePath("/admin");
    revalidatePath("/shop");
    redirect("/admin?action=delete-meril&status=ok");
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }
    redirect("/admin?action=delete-meril&status=error");
  }
}
