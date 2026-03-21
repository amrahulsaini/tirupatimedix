import { rm, unlink } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { dbQuery, ensureDatabaseSchema } from "@/lib/db";

const ADMIN_COOKIE = "medix_admin_session";

type Operation =
  | "create-medicine"
  | "update-medicine"
  | "delete-medicine"
  | "delete-image"
  | "create-meril"
  | "update-meril"
  | "delete-meril"
  | "delete-meril-image"
  | "create-meril-semi"
  | "update-meril-semi"
  | "delete-meril-semi"
  | "delete-meril-semi-image";

function toNumber(value: FormDataEntryValue | null) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function toText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function redirectToAdmin(action: string, status: "ok" | "invalid" | "error") {
  return NextResponse.redirect(new URL(`/admin?action=${action}&status=${status}`, process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"), {
    status: 303,
  });
}

function unauthorizedRedirect() {
  return NextResponse.redirect(new URL("/admin", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"), {
    status: 303,
  });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE)?.value;
  if (session !== "1") {
    return unauthorizedRedirect();
  }

  let action = "unknown";
  let status: "ok" | "invalid" | "error" = "ok";

  try {
    await ensureDatabaseSchema();

    const formData = await request.formData();
    const op = toText(formData.get("op")) as Operation;
    action = op;

    switch (op) {
      case "create-medicine": {
        const code = toText(formData.get("code"));
        const category = toText(formData.get("category"));
        const genericName = toText(formData.get("generic_name"));
        const packingPerBox = toNumber(formData.get("packing_per_box"));
        const dpUnits = toNumber(formData.get("dp_units"));
        const mrpUnits = toNumber(formData.get("mrp_units"));
        const cutPrice = toNumber(formData.get("cut_price"));

        if (!code || !category || !genericName) {
          status = "invalid";
          break;
        }

        await dbQuery(
          `INSERT INTO hollister (code, category, generic_name, packing_per_box, dp_units, mrp_units, cut_price)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [code, category, genericName, packingPerBox, dpUnits, mrpUnits, cutPrice]
        );
        break;
      }

      case "update-medicine": {
        const id = toNumber(formData.get("id"));
        const code = toText(formData.get("code"));
        const category = toText(formData.get("category"));
        const genericName = toText(formData.get("generic_name"));
        const packingPerBox = toNumber(formData.get("packing_per_box"));
        const dpUnits = toNumber(formData.get("dp_units"));
        const mrpUnits = toNumber(formData.get("mrp_units"));
        const cutPrice = toNumber(formData.get("cut_price"));

        if (!id || !code || !category || !genericName) {
          status = "invalid";
          break;
        }

        await dbQuery(
          `UPDATE hollister
           SET code = ?, category = ?, generic_name = ?, packing_per_box = ?, dp_units = ?, mrp_units = ?, cut_price = ?
           WHERE id = ?`,
          [code, category, genericName, packingPerBox, dpUnits, mrpUnits, cutPrice, id]
        );
        break;
      }

      case "delete-medicine": {
        const id = toNumber(formData.get("id"));
        if (!id) {
          status = "invalid";
          break;
        }

        await dbQuery("DELETE FROM hollister WHERE id = ?", [id]);
        const medicineDir = path.join(process.cwd(), "public", "uploads", "medicines", String(id));
        await rm(medicineDir, { recursive: true, force: true }).catch(() => {});
        break;
      }

      case "delete-image": {
        const imageId = toNumber(formData.get("image_id"));
        const imagePath = toText(formData.get("image_path"));
        if (!imageId || !imagePath) {
          status = "invalid";
          break;
        }

        await dbQuery("DELETE FROM medicine_images WHERE id = ?", [imageId]);
        const diskPath = path.join(process.cwd(), "public", imagePath.replace(/^\//, ""));
        await unlink(diskPath).catch(() => {});
        break;
      }

      case "create-meril": {
        const srNo = toNumber(formData.get("sr_no"));
        const category = toText(formData.get("category"));
        const productName = toText(formData.get("product_name"));
        const packSize = toText(formData.get("pack_size"));
        const mrpUnits = toNumber(formData.get("mrp_units"));
        const cutPrice = toNumber(formData.get("cut_price"));
        const gst = toText(formData.get("gst"));

        if (!srNo || !category || !productName || !packSize || !gst) {
          status = "invalid";
          break;
        }

        await dbQuery(
          `INSERT INTO meril_fully_automatic (sr_no, category, product_name, pack_size, mrp_units, cut_price, gst)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [srNo, category, productName, packSize, mrpUnits, cutPrice, gst]
        );
        break;
      }

      case "update-meril": {
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
          break;
        }

        await dbQuery(
          `UPDATE meril_fully_automatic
           SET sr_no = ?, category = ?, product_name = ?, pack_size = ?, mrp_units = ?, cut_price = ?, gst = ?
           WHERE id = ?`,
          [srNo, category, productName, packSize, mrpUnits, cutPrice, gst, id]
        );
        break;
      }

      case "delete-meril": {
        const id = toNumber(formData.get("id"));
        if (!id) {
          status = "invalid";
          break;
        }

        await dbQuery("DELETE FROM meril_fully_automatic WHERE id = ?", [id]);
        const merilDir = path.join(process.cwd(), "public", "uploads", "meril", String(id));
        await rm(merilDir, { recursive: true, force: true }).catch(() => {});
        break;
      }

      case "delete-meril-image": {
        const imageId = toNumber(formData.get("image_id"));
        const imagePath = toText(formData.get("image_path"));
        if (!imageId || !imagePath) {
          status = "invalid";
          break;
        }

        await dbQuery("DELETE FROM meril_product_images WHERE id = ?", [imageId]);
        const diskPath = path.join(process.cwd(), "public", imagePath.replace(/^\//, ""));
        await unlink(diskPath).catch(() => {});
        break;
      }

      case "create-meril-semi": {
        const srNo = toNumber(formData.get("sr_no"));
        const category = toText(formData.get("category"));
        const productName = toText(formData.get("product_name"));
        const packSize = toText(formData.get("pack_size"));
        const mrpUnits = toNumber(formData.get("mrp_units"));
        const cutPrice = toNumber(formData.get("cut_price"));
        const gst = toText(formData.get("gst"));

        if (!srNo || !category || !productName || !packSize || !gst) {
          status = "invalid";
          break;
        }

        await dbQuery(
          `INSERT INTO meril_semi_automatic (sr_no, category, product_name, pack_size, mrp_units, cut_price, gst)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [srNo, category, productName, packSize, mrpUnits, cutPrice, gst]
        );
        break;
      }

      case "update-meril-semi": {
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
          break;
        }

        await dbQuery(
          `UPDATE meril_semi_automatic
           SET sr_no = ?, category = ?, product_name = ?, pack_size = ?, mrp_units = ?, cut_price = ?, gst = ?
           WHERE id = ?`,
          [srNo, category, productName, packSize, mrpUnits, cutPrice, gst, id]
        );
        break;
      }

      case "delete-meril-semi": {
        const id = toNumber(formData.get("id"));
        if (!id) {
          status = "invalid";
          break;
        }

        await dbQuery("DELETE FROM meril_semi_automatic WHERE id = ?", [id]);
        const semiDir = path.join(process.cwd(), "public", "uploads", "meril-semi", String(id));
        await rm(semiDir, { recursive: true, force: true }).catch(() => {});
        break;
      }

      case "delete-meril-semi-image": {
        const imageId = toNumber(formData.get("image_id"));
        const imagePath = toText(formData.get("image_path"));
        if (!imageId || !imagePath) {
          status = "invalid";
          break;
        }

        await dbQuery("DELETE FROM meril_semi_product_images WHERE id = ?", [imageId]);
        const semiDiskPath = path.join(process.cwd(), "public", imagePath.replace(/^\//, ""));
        await unlink(semiDiskPath).catch(() => {});
        break;
      }

      default:
        action = "unknown";
        status = "invalid";
        break;
    }
  } catch (error) {
    console.error("admin mutate route error:", error);
    status = "error";
  }

  revalidatePath("/admin");
  revalidatePath("/shop");
  return redirectToAdmin(action, status);
}
