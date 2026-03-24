import "server-only";

import { getAllDynamicTechnoProducts } from "@/lib/dynamic-techno";
import { getAllMedicines } from "@/lib/medicines";
import { getAllMerilProducts } from "@/lib/meril";
import { getAllMerilSemiProducts } from "@/lib/meril-semi";

export type SearchResultItem = {
  id: string;
  productType: "hollister" | "meril_fa" | "meril_sa" | "dynamic";
  productId: number;
  code: string;
  name: string;
  subtitle: string;
  image: string | null;
  cutPrice: number;
  mrpPrice: number;
  category: string;
  shopPath: string;
  score: number;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDiscountPercent(mrpPrice: number, cutPrice: number) {
  if (mrpPrice <= 0) {
    return 0;
  }

  return Math.max(0, Math.round(((mrpPrice - cutPrice) / mrpPrice) * 100));
}

function rankItem(item: Omit<SearchResultItem, "score">, query: string) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return 0;
  }

  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  const code = normalize(item.code);
  const name = normalize(item.name);
  const subtitle = normalize(item.subtitle);
  const category = normalize(item.category);
  const fullText = `${name} ${code} ${subtitle} ${category}`;

  let score = 0;

  if (code === normalizedQuery) {
    score += 180;
  }

  if (name === normalizedQuery) {
    score += 160;
  }

  if (name.startsWith(normalizedQuery)) {
    score += 110;
  }

  if (code.startsWith(normalizedQuery)) {
    score += 95;
  }

  if (name.includes(normalizedQuery)) {
    score += 80;
  }

  if (code.includes(normalizedQuery)) {
    score += 70;
  }

  if (subtitle.includes(normalizedQuery)) {
    score += 35;
  }

  if (category.includes(normalizedQuery)) {
    score += 22;
  }

  let matchedTokens = 0;
  for (const token of queryTokens) {
    if (fullText.includes(token)) {
      matchedTokens += 1;
      score += token.length > 2 ? 14 : 8;
    }
  }

  if (queryTokens.length > 1 && matchedTokens < queryTokens.length) {
    score -= (queryTokens.length - matchedTokens) * 18;
  }

  if (!fullText.includes(normalizedQuery) && matchedTokens === 0) {
    return 0;
  }

  score += getDiscountPercent(item.mrpPrice, item.cutPrice) > 0 ? 2 : 0;

  return score;
}

export async function searchCatalogProducts(query: string, limit = 36): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const [medicines, merilProducts, merilSemiProducts, dynamicProducts] = await Promise.all([
    getAllMedicines().catch(() => []),
    getAllMerilProducts().catch(() => []),
    getAllMerilSemiProducts().catch(() => []),
    getAllDynamicTechnoProducts().catch(() => []),
  ]);

  const candidates: Omit<SearchResultItem, "score">[] = [
    ...medicines.map((item) => ({
      id: `hollister-${item.id}`,
      productType: "hollister" as const,
      productId: item.id,
      code: item.code,
      name: item.genericName,
      subtitle: `${item.category} · Pack ${item.packingPerBox}`,
      image: item.images[0] ?? null,
      cutPrice: item.cutPrice,
      mrpPrice: item.mrpUnits,
      category: item.category,
      shopPath: "/shop/ostomy-care",
    })),
    ...merilProducts.map((item) => ({
      id: `meril-fa-${item.id}`,
      productType: "meril_fa" as const,
      productId: item.id,
      code: String(item.srNo),
      name: item.productName,
      subtitle: `${item.category} · Pack ${item.packSize}`,
      image: item.images[0] ?? null,
      cutPrice: item.cutPrice,
      mrpPrice: item.mrpUnits,
      category: item.category,
      shopPath: "/shop/pathology-products",
    })),
    ...merilSemiProducts.map((item) => ({
      id: `meril-sa-${item.id}`,
      productType: "meril_sa" as const,
      productId: item.id,
      code: String(item.srNo),
      name: item.productName,
      subtitle: `${item.category} · Pack ${item.packSize}`,
      image: item.images[0] ?? null,
      cutPrice: item.cutPrice,
      mrpPrice: item.mrpUnits,
      category: item.category,
      shopPath: "/shop/pathology-products",
    })),
    ...dynamicProducts.map((item) => ({
      id: `dynamic-${item.id}`,
      productType: "dynamic" as const,
      productId: item.id,
      code: item.itemCode,
      name: item.productDescription,
      subtitle: `${item.brandName} · ${item.size} ${item.uom}`,
      image: item.images[0] ?? null,
      cutPrice: item.cutPrice,
      mrpPrice: item.mrp,
      category: "Wound Dressing",
      shopPath: "/shop/wound-dressing",
    })),
  ];

  return candidates
    .map((item) => ({ ...item, score: rankItem(item, trimmed) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}
