import { NextResponse } from "next/server";

import { searchCatalogProducts } from "@/lib/product-search";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = (url.searchParams.get("q") ?? "").trim();

    if (!query) {
      return NextResponse.json({ ok: true, query: "", results: [] });
    }

    const results = await searchCatalogProducts(query, 24);
    return NextResponse.json({ ok: true, query, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
