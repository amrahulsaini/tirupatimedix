import { NextResponse } from "next/server";
import path from "node:path";
import { readFile } from "node:fs/promises";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const slugParams = await params;
    const slug = slugParams.slug || [];
    
    // Safety check: Prevent directory traversal
    if (slug.some(segment => segment.includes('..'))) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", ...slug);
    
    // Read the file
    const fileBuffer = await readFile(filePath);

    // Basic content-type detection based on extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".svg") contentType = "image/svg+xml";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return new NextResponse("File not found", { status: 404 });
    }
    console.error("Error serving uploaded file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
