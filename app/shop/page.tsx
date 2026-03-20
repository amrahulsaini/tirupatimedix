import type { Metadata } from "next";
import Link from "next/link";

import { SectionTitle } from "@/app/_components/section-title";
import { getAllMerilProducts } from "@/lib/meril";
import { getAllMedicines } from "@/lib/medicines";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Medicines",
  description: "Browse all available medicines and wellness products at Tirupati Medix.",
};

type ShopPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const selectedCategory = (params.category ?? "").trim();

  const medicines = await getAllMedicines().catch(() => []);
  const merilProducts = await getAllMerilProducts().catch(() => []);
  const allCategories = [
    ...new Set([...medicines.map((item) => item.category), ...merilProducts.map((item) => item.category)]),
  ];

  const filteredMedicines = selectedCategory
    ? medicines.filter((item) => item.category === selectedCategory)
    : medicines;

  const filteredMeril = selectedCategory
    ? merilProducts.filter((item) => item.category === selectedCategory)
    : merilProducts;

  const filteredMedicineCategories = [...new Set(filteredMedicines.map((item) => item.category))];
  const totalFiltered = filteredMedicines.length + filteredMeril.length;

  return (
    <div className="content-page container">
      <div className="content-hero">
        <h1>Shop Medicines</h1>
        <p>
          Explore medicines directly from your MySQL catalog with category-based listing,
          medicine code, and live pricing from your database.
        </p>
      </div>

      <section className="section filter-bar">
        <p>Filter By Category</p>
        <div className="filter-chips">
          <Link href="/shop" className={`filter-chip ${selectedCategory ? "" : "filter-chip--active"}`}>
            All Categories
          </Link>
          {allCategories.map((category) => (
            <Link
              key={category}
              href={{ pathname: "/shop", query: { category } }}
              className={`filter-chip ${selectedCategory === category ? "filter-chip--active" : ""}`}
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      {totalFiltered === 0 ? (
        <section className="section info-card">
          <h2>No products found for this category</h2>
          <p className="muted">
            Try a different filter or add products from `/admin`.
          </p>
        </section>
      ) : (
        filteredMedicineCategories.map((category) => {
          const categoryItems = filteredMedicines.filter((item) => item.category === category);

          return (
            <section className="section" key={category}>
              <SectionTitle
                eyebrow="Category"
                title={category}
                subtitle={`${categoryItems.length} products available`}
              />
              <div className="product-grid">
                {categoryItems.map((item) => (
                  <article key={item.id} className="product-card">
                    <div className="product-card__badge-row">
                      <span className="pill">Code: {item.code}</span>
                      <span className="stock stock--ok">Pack: {item.packingPerBox}</span>
                    </div>
                    {item.images[0] ? (
                      <img src={item.images[0]} alt={item.genericName} className="db-medicine-image" />
                    ) : null}
                    <h3>{item.genericName}</h3>
                    <p className="muted">DP: Rs. {item.dpUnits.toFixed(2)} per unit</p>
                    <div className="price-row">
                      <strong>Rs. {item.cutPrice.toFixed(2)}</strong>
                      <span>Rs. {item.mrpUnits.toFixed(2)}</span>
                      <em>Best Price</em>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })
      )}

      {filteredMeril.length > 0 ? (
        <section className="section">
          <SectionTitle
            eyebrow="Special Catalog"
            title="Meril Fully Automatic"
            subtitle={`${filteredMeril.length} products available`}
          />
          <div className="product-grid">
            {filteredMeril.map((item) => (
              <article key={item.id} className="product-card meril-card">
                <h3>{item.productName}</h3>
                <p className="muted">Pack Size: {item.packSize}</p>
                <p className="muted">Category: {item.category}</p>
                <div className="price-row">
                  <strong>Rs. {item.cutPrice.toFixed(2)}</strong>
                  <span>Rs. {item.mrpUnits.toFixed(2)}</span>
                  <em>Best Price</em>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
