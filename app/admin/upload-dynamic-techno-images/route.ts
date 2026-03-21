import { randomUUID } from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { dbQuery, ensureDatabaseSchema } from "@/lib/db";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function sanitizeExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg" || extension === ".png" || extension === ".webp" || extension === ".gif") {
    return extension;
  }
  return ".jpg";
}

function createRedirectUrl(pathname: string, requestUrl: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? requestUrl;
    return new URL(pathname, baseUrl).toString();
  } catch {
    return pathname;
  }
}

function isAjaxUpload(request: Request) {
  const accept = request.headers.get("accept") ?? "";
  return request.headers.get("x-medix-ajax") === "1" || accept.includes("application/json");
}

function respondUpload(request: Request, code: "ok" | "empty" | "invalid" | "large" | "server") {
  if (isAjaxUpload(request)) {
    return NextResponse.json({ status: code });
  }
  return NextResponse.redirect(createRedirectUrl(`/admin?upload=${code}`, request.url), { status: 303 });
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const isLoggedIn = cookieStore.get("medix_admin_session")?.value === "1";

    if (!isLoggedIn) {
      if (isAjaxUpload(request)) {
        return NextResponse.json({ status: "server", error: "unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(createRedirectUrl("/admin", request.url), { status: 303 });
    }

    await ensureDatabaseSchema();

    const formData = await request.formData();
    const productIdRaw = formData.get("dynamic_techno_id");
    const productId = Number(productIdRaw);

    if (!Number.isInteger(productId) || productId <= 0) {
      return respondUpload(request, "invalid");
    }

    const files = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) {
      return respondUpload(request, "empty");
    }

    const [rows] = await dbQuery<Array<{ id: number }>>(
      "SELECT id FROM dynamic_techno WHERE id = ? LIMIT 1",
      [productId]
    );
    if (!rows.length) {
      return respondUpload(request, "invalid");
    }

    if (files.some((file) => file.size > MAX_IMAGE_SIZE_BYTES)) {
      return respondUpload(request, "large");
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "dynamic-techno", String(productId));
    await mkdir(uploadDir, { recursive: true });

    const [sortRows] = await dbQuery<Array<{ max_sort: number | null }>>(
      "SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM dynamic_techno_product_images WHERE dynamic_techno_product_id = ?",
      [productId]
    );
    let nextSort = Number(sortRows[0]?.max_sort ?? 0);

    for (const file of files) {
      nextSort += 1;
      const extension = sanitizeExtension(file.name);
      const fileName = `${Date.now()}-${randomUUID()}${extension}`;
      const diskPath = path.join(uploadDir, fileName);
      const publicPath = `/uploads/dynamic-techno/${productId}/${fileName}`;

      const bytes = await file.arrayBuffer();
      await writeFile(diskPath, Buffer.from(bytes));

      await dbQuery(
        "INSERT INTO dynamic_techno_product_images (dynamic_techno_product_id, image_path, sort_order) VALUES (?, ?, ?)",
        [productId, publicPath, nextSort]
      );
    }

    return respondUpload(request, "ok");
  } catch (error) {
    console.error("Failed to upload Dynamic Techno product images", error);
    return respondUpload(request, "server");
  }
}
