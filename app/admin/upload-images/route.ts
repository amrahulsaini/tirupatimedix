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

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("medix_admin_session")?.value === "1";

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
  }

  try {
    await ensureDatabaseSchema();

    const formData = await request.formData();
    const medicineIdRaw = formData.get("medicine_id");
    const medicineId = Number(medicineIdRaw);

    if (!Number.isInteger(medicineId) || medicineId <= 0) {
      return NextResponse.redirect(new URL("/admin?upload=invalid", request.url), { status: 303 });
    }

    const files = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) {
      return NextResponse.redirect(new URL("/admin?upload=empty", request.url), { status: 303 });
    }

    const [medicineRows] = await dbQuery<Array<{ id: number }>>("SELECT id FROM hollister WHERE id = ? LIMIT 1", [medicineId]);
    if (!medicineRows.length) {
      return NextResponse.redirect(new URL("/admin?upload=invalid", request.url), { status: 303 });
    }

    if (files.some((file) => file.size > MAX_IMAGE_SIZE_BYTES)) {
      return NextResponse.redirect(new URL("/admin?upload=large", request.url), { status: 303 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "medicines", String(medicineId));
    await mkdir(uploadDir, { recursive: true });

    const [sortRows] = await dbQuery<Array<{ max_sort: number | null }>>(
      "SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM medicine_images WHERE medicine_id = ?",
      [medicineId]
    );
    let nextSort = Number(sortRows[0]?.max_sort ?? 0);

    for (const file of files) {
      nextSort += 1;
      const extension = sanitizeExtension(file.name);
      const fileName = `${Date.now()}-${randomUUID()}${extension}`;
      const diskPath = path.join(uploadDir, fileName);
      const publicPath = `/uploads/medicines/${medicineId}/${fileName}`;

      const bytes = await file.arrayBuffer();
      await writeFile(diskPath, Buffer.from(bytes));

      await dbQuery(
        "INSERT INTO medicine_images (medicine_id, image_path, sort_order) VALUES (?, ?, ?)",
        [medicineId, publicPath, nextSort]
      );
    }

    return NextResponse.redirect(new URL("/admin?upload=ok", request.url), { status: 303 });
  } catch (error) {
    console.error("Failed to upload medicine images", error);
    return NextResponse.redirect(new URL("/admin?upload=server", request.url), { status: 303 });
  }
}
