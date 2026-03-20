import type { Metadata } from "next";

import { ProductCard } from "@/app/_components/product-card";
import { SectionTitle } from "@/app/_components/section-title";
import { products } from "@/app/_data/products";

export const metadata: Metadata = {
  title: "Shop Medicines",
  description: "Browse all available medicines and wellness products at Tirupati Medix.",
};

export default function ShopPage() {
  return (
    <div className="content-page container">
      <div className="content-hero">
        <h1>Shop Medicines</h1>
        <p>
          Explore trusted prescription support products, OTC medicines, supplements, and daily
          healthcare essentials curated for Indian families.
        </p>
      </div>

      <section className="section">
        <SectionTitle
          eyebrow="Full Catalog"
          title="Available Products"
          subtitle="Prices shown are indicative and can vary based on prescription and availability."
        />
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
