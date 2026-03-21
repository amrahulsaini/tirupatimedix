import type { Metadata } from "next";
import Link from "next/link";

import { SectionTitle } from "@/app/_components/section-title";
import { getAllMerilProducts } from "@/lib/meril";
import { getAllMerilSemiProducts } from "@/lib/meril-semi";
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
  const merilSemiProducts = await getAllMerilSemiProducts().catch(() => []);

  const categoryEntries = [
    { key: "hollister", label: "Hollister" },
    { key: "meril-fully-automatic", label: "Meril Fully Automatic" },
    { key: "meril-semi-automatic", label: "Meril Semi Automatic" },
  ];

  const allMedicineCategories = [...new Set(medicines.map((item) => item.category))];

  const showHollister = !selectedCategory || selectedCategory === "hollister" || allMedicineCategories.includes(selectedCategory);
  const showMerilFull = !selectedCategory || selectedCategory === "meril-fully-automatic";
  const showMerilSemi = !selectedCategory || selectedCategory === "meril-semi-automatic";

  const filteredMedicines = selectedCategory && selectedCategory !== "hollister"
    ? medicines.filter((item) => item.category === selectedCategory)
    : selectedCategory === "hollister" ? medicines : (!selectedCategory ? medicines : []);

  const filteredMedicineCategories = [...new Set(filteredMedicines.map((item) => item.category))];

  const totalFiltered =
    filteredMedicines.length +
    (showMerilFull ? merilProducts.length : 0) +
    (showMerilSemi ? merilSemiProducts.length : 0);

  return (
    <div className="content-page container">
      <div className="content-hero">
        <h1>Shop Ostomy Care Products</h1>
        <p>
          Explore our complete range of ostomy care and diagnostic products with
          transparent pricing and category-wise listings.
        </p>
      </div>

      <section className="section filter-bar">
        <p>Filter By Category</p>
        <div className="filter-chips">
          <Link href="/shop" className={`filter-chip ${selectedCategory ? "" : "filter-chip--active"}`}>
            All Categories
          </Link>
          {categoryEntries.map((entry) => (
            <Link
              key={entry.key}
              href={{ pathname: "/shop", query: { category: entry.key } }}
              className={`filter-chip ${selectedCategory === entry.key ? "filter-chip--active" : ""}`}
            >
              {entry.label}
            </Link>
          ))}
          {allMedicineCategories.map((category) => (
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
          <p className="muted">Try a different filter or check back shortly.</p>
        </section>
      ) : null}

      {showHollister && filteredMedicines.length > 0
        ? filteredMedicineCategories.map((category) => {
            const categoryItems = filteredMedicines.filter((item) => item.category === category);

            return (
              <section className="section" key={category}>
                <SectionTitle
                  eyebrow="Hollister"
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
        : null}

      {showMerilFull && merilProducts.length > 0 ? (
        <section className="section">
          <SectionTitle
            eyebrow="Meril"
            title="Meril Fully Automatic"
            subtitle={`${merilProducts.length} products available`}
          />
          <div className="product-grid">
            {merilProducts.map((item) => (
              <article key={item.id} className="product-card meril-card">
                {item.images[0] ? (
                  <img src={item.images[0]} alt={item.productName} className="db-medicine-image" />
                ) : null}
                <h3>{item.productName}</h3>
                <p className="muted">Pack Size: {item.packSize}</p>
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

      {showMerilSemi && merilSemiProducts.length > 0 ? (
        <section className="section">
          <SectionTitle
            eyebrow="Meril"
            title="Meril Semi Automatic"
            subtitle={`${merilSemiProducts.length} products available`}
          />
          <div className="product-grid">
            {merilSemiProducts.map((item) => (
              <article key={item.id} className="product-card meril-card meril-semi-card">
                {item.images[0] ? (
                  <img src={item.images[0]} alt={item.productName} className="db-medicine-image" />
                ) : null}
                <h3>{item.productName}</h3>
                <p className="muted">Pack Size: {item.packSize}</p>
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
