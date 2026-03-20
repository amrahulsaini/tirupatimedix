import type { Metadata } from "next";

import { SectionTitle } from "@/app/_components/section-title";
import { getAllMerilProducts } from "@/lib/meril";
import { getAllMedicines } from "@/lib/medicines";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Medicines",
  description: "Browse all available medicines and wellness products at Tirupati Medix.",
};

export default async function ShopPage() {
  const medicines = await getAllMedicines().catch(() => []);
  const categories = [...new Set(medicines.map((item) => item.category))];
  const merilProducts = await getAllMerilProducts().catch(() => []);

  return (
    <div className="content-page container">
      <div className="content-hero">
        <h1>Shop Medicines</h1>
        <p>
          Explore medicines directly from your MySQL catalog with category-based listing,
          medicine code, and live pricing from your database.
        </p>
      </div>

      {medicines.length === 0 ? (
        <section className="section info-card">
          <h2>No medicines found</h2>
          <p className="muted">
            Add products from `/admin` and ensure DB variables in `.env.local` are configured.
          </p>
        </section>
      ) : (
        categories.map((category) => {
          const categoryItems = medicines.filter((item) => item.category === category);

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

      {merilProducts.length > 0 ? (
        <section className="section">
          <SectionTitle
            eyebrow="Special Catalog"
            title="Meril Fully Automatic"
            subtitle={`${merilProducts.length} products available`}
          />
          <div className="product-grid">
            {merilProducts.map((item) => (
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
