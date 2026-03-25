import type { Metadata } from "next";
import Link from "next/link";

import { SectionTitle } from "@/app/_components/section-title";
import { ShopProductActions } from "@/app/_components/shop-product-actions";
import { searchCatalogProducts } from "@/lib/product-search";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search Products",
  description: "Search products by code, name, brand, and category.",
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const results = query ? await searchCatalogProducts(query, 36) : [];

  return (
    <div className="content-page container">
      <div className="content-hero search-hero">
        <h1>Search Products</h1>
        <p>Find products by code number, name, brand, and category keywords.</p>
        <form action="/search" className="search-page-form" role="search">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Try: 12345, Hollister, Meril, Coloplast"
            aria-label="Search products"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {!query ? (
        <section className="section info-card">
          <h2>Start searching</h2>
          <p className="muted">Enter code, name, or brand keyword to see matching products.</p>
        </section>
      ) : null}

      {query ? (
        <section className="section">
          <SectionTitle
            eyebrow="Search Results"
            title={`Results for \"${query}\"`}
            subtitle={`${results.length} products matched your query`}
          />

          {results.length === 0 ? (
            <div className="info-card">
              <h3>No matching products found</h3>
              <p className="muted">Try a shorter keyword or product code.</p>
              <div className="search-empty-actions">
                <Link href="/shop" className="btn btn-secondary">Browse All Products</Link>
              </div>
            </div>
          ) : (
            <div className="product-grid search-results-grid">
              {results.map((item) => {
                const discountPercent = Math.max(
                  0,
                  Math.round(((item.mrpPrice - item.cutPrice) / item.mrpPrice) * 100)
                );

                return (
                  <article key={item.id} className="product-card">
                    {item.image ? <img src={item.image} alt={item.name} className="db-medicine-image" /> : null}
                    <h3>{item.name} - {item.code}</h3>
                    <p className="muted">{item.subtitle}</p>
                    <p className="search-result-meta">Category: {item.category}</p>
                    <p className="discount-note">Save {discountPercent}% on MRP</p>
                    <div className="price-row">
                      <strong>Rs. {item.cutPrice.toFixed(2)}</strong>
                      <span>Rs. {item.mrpPrice.toFixed(2)}</span>
                      <em>Best Price</em>
                    </div>
                    <div className="search-result-actions">
                      <Link href={item.shopPath} className="btn btn-secondary">Open Category</Link>
                    </div>
                    <ShopProductActions productType={item.productType} productId={item.productId} />
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
