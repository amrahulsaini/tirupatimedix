import type { Metadata } from "next";
import Link from "next/link";

import { SectionTitle } from "@/app/_components/section-title";
import { getAllMerilProducts } from "@/lib/meril";
import { getAllMerilSemiProducts } from "@/lib/meril-semi";
import { getAllMedicines } from "@/lib/medicines";
import { getAllDynamicTechnoProducts } from "@/lib/dynamic-techno";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Medicines",
  description: "Browse all available medicines and wellness products at Tirupati Medix.",
};

export default async function ShopPage() {
  const medicines = await getAllMedicines().catch(() => []);
  const merilProducts = await getAllMerilProducts().catch(() => []);
  const merilSemiProducts = await getAllMerilSemiProducts().catch(() => []);
  const dynamicTechnoProducts = await getAllDynamicTechnoProducts().catch(() => []);

  const totalProducts = medicines.length + merilProducts.length + merilSemiProducts.length + dynamicTechnoProducts.length;

  const hollisterCategories = [...new Set(medicines.map((item) => item.category))];

  return (
    <div className="content-page container">
      <div className="content-hero">
        <h1>Shop Ostomy Care Products</h1>
        <p>
          Explore our complete range of ostomy care and diagnostic products with
          transparent pricing and category-wise listings.
        </p>
      </div>

      <nav className="section filter-bar">
        <p>Filter By Category</p>
        <div className="filter-chips">
          <Link href="/shop" className="filter-chip filter-chip--active">All Categories</Link>
          <Link href="/shop/hollister" className="filter-chip">Hollister</Link>
          <Link href="/shop/meril-fully-automatic" className="filter-chip">Meril Fully Automatic</Link>
          <Link href="/shop/meril-semi-automatic" className="filter-chip">Meril Semi Automatic</Link>
          <Link href="/shop/dynamic-techno" className="filter-chip">Dynamic Techno</Link>
        </div>
      </nav>

      {totalProducts === 0 ? (
        <section className="section info-card">
          <h2>No products found</h2>
          <p className="muted">Check back shortly or add products from the admin panel.</p>
        </section>
      ) : null}

      {medicines.length > 0
        ? hollisterCategories.map((category) => {
            const categoryItems = medicines.filter((item) => item.category === category);
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
                        <span className="stock stock--ok">Pack: {item.packingPerBox}</span>
                      </div>
                      {item.images[0] ? (
                        <img src={item.images[0]} alt={item.genericName} className="db-medicine-image" />
                      ) : null}
                      <h3>{item.genericName} – {item.code}</h3>
                      <p className="muted">DP: ₹{item.dpUnits.toFixed(2)} per unit</p>
                      <div className="price-row">
                        <strong>₹{item.cutPrice.toFixed(2)}</strong>
                        <span>₹{item.mrpUnits.toFixed(2)}</span>
                        <em>Best Price</em>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })
        : null}

      {merilProducts.length > 0 ? (
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
                <h3>{item.productName} – {item.srNo}</h3>
                <p className="muted">Pack Size: {item.packSize}</p>
                <div className="price-row">
                  <strong>₹{item.cutPrice.toFixed(2)}</strong>
                  <span>₹{item.mrpUnits.toFixed(2)}</span>
                  <em>Best Price</em>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {merilSemiProducts.length > 0 ? (
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
                <h3>{item.productName} – {item.srNo}</h3>
                <p className="muted">Pack Size: {item.packSize}</p>
                <div className="price-row">
                  <strong>₹{item.cutPrice.toFixed(2)}</strong>
                  <span>₹{item.mrpUnits.toFixed(2)}</span>
                  <em>Best Price</em>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {dynamicTechnoProducts.length > 0 ? (
        <section className="section">
          <SectionTitle
            eyebrow="Dynamic Techno"
            title="Dynamic Techno Medicals"
            subtitle={`${dynamicTechnoProducts.length} products available`}
          />
          <div className="product-grid">
            {dynamicTechnoProducts.map((item) => (
              <article key={item.id} className="product-card dynamic-techno-card">
                {item.images[0] ? (
                  <img src={item.images[0]} alt={item.productDescription} className="db-medicine-image" />
                ) : null}
                <h3>{item.productDescription} – {item.itemCode}</h3>
                <p className="muted">{item.brandName} · Size: {item.size} · UOM: {item.uom}</p>
                <div className="price-row">
                  <strong>₹{item.cutPrice.toFixed(2)}</strong>
                  <span>₹{item.mrp.toFixed(2)}</span>
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
