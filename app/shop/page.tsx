import type { Metadata } from "next";
import Link from "next/link";

import { SectionTitle } from "@/app/_components/section-title";
import { ShopProductActions } from "@/app/_components/shop-product-actions";
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
        <h1>Shop Medical Products</h1>
        <p>
          Explore our complete range of ostomy care, pathology, and wound dressing products with
          transparent pricing and category-wise listings.
        </p>
      </div>

      <nav className="section filter-bar">
        <p>Filter By Category</p>
        <div className="filter-chips">
          <Link href="/shop" className="filter-chip filter-chip--active">All Categories</Link>
          <Link href="/shop/ostomy-care" className="filter-chip">Ostomy Care</Link>
          <Link href="/shop/pathology-products" className="filter-chip">Pathology Products</Link>
          <Link href="/shop/wound-dressing" className="filter-chip">Wound Dressing</Link>
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
                  eyebrow="Ostomy Care"
                  title={category}
                  subtitle={`${categoryItems.length} products available`}
                />
                <div className="product-grid">
                  {categoryItems.map((item) => {
                    const discountPercent = Math.max(
                      0,
                      Math.round(((item.mrpUnits - item.cutPrice) / item.mrpUnits) * 100)
                    );
                    return (
                      <article key={item.id} className="product-card">
                        <div className="product-card__badge-row">
                          <span className="stock stock--ok">Pack: {item.packingPerBox}</span>
                        </div>
                        {item.images[0] ? (
                          <img src={item.images[0]} alt={item.genericName} className="db-medicine-image" />
                        ) : null}
                        <h3>{item.genericName} – {item.code}</h3>
                        <p className="discount-note">Save {discountPercent}% on MRP</p>
                        <div className="price-row">
                          <strong>₹{item.cutPrice.toFixed(2)}</strong>
                          <span>₹{item.mrpUnits.toFixed(2)}</span>
                          <em>Best Price</em>
                        </div>
                        <ShopProductActions productType="hollister" productId={item.id} />
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })
        : null}

      {merilProducts.length > 0 ? (
        <section className="section">
          <SectionTitle
            eyebrow="Pathology"
            title="Fully Automatic Reagents"
            subtitle={`${merilProducts.length} products available`}
          />
          <div className="product-grid">
            {merilProducts.map((item) => {
              const discountPercent = Math.max(
                0,
                Math.round(((item.mrpUnits - item.cutPrice) / item.mrpUnits) * 100)
              );
              return (
                <article key={item.id} className="product-card meril-card">
                  {item.images[0] ? (
                    <img src={item.images[0]} alt={item.productName} className="db-medicine-image" />
                  ) : null}
                  <h3>{item.productName} – {item.srNo}</h3>
                  <p className="muted">Pack Size: {item.packSize}</p>
                  <p className="discount-note">Save {discountPercent}% on MRP</p>
                  <div className="price-row">
                    <strong>₹{item.cutPrice.toFixed(2)}</strong>
                    <span>₹{item.mrpUnits.toFixed(2)}</span>
                    <em>Best Price</em>
                  </div>
                  <ShopProductActions productType="meril_fa" productId={item.id} />
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {merilSemiProducts.length > 0 ? (
        <section className="section">
          <SectionTitle
            eyebrow="Pathology"
            title="Semi Automatic Reagents"
            subtitle={`${merilSemiProducts.length} products available`}
          />
          <div className="product-grid">
            {merilSemiProducts.map((item) => {
              const discountPercent = Math.max(
                0,
                Math.round(((item.mrpUnits - item.cutPrice) / item.mrpUnits) * 100)
              );
              return (
                <article key={item.id} className="product-card meril-card meril-semi-card">
                  {item.images[0] ? (
                    <img src={item.images[0]} alt={item.productName} className="db-medicine-image" />
                  ) : null}
                  <h3>{item.productName} – {item.srNo}</h3>
                  <p className="muted">Pack Size: {item.packSize}</p>
                  <p className="discount-note">Save {discountPercent}% on MRP</p>
                  <div className="price-row">
                    <strong>₹{item.cutPrice.toFixed(2)}</strong>
                    <span>₹{item.mrpUnits.toFixed(2)}</span>
                    <em>Best Price</em>
                  </div>
                  <ShopProductActions productType="meril_sa" productId={item.id} />
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {dynamicTechnoProducts.length > 0 ? (
        <section className="section">
          <SectionTitle
            eyebrow="Wound Dressing"
            title="Wound Dressing Products"
            subtitle={`${dynamicTechnoProducts.length} products available`}
          />
          <div className="product-grid">
            {dynamicTechnoProducts.map((item) => {
              const discountPercent = Math.max(
                0,
                Math.round(((item.mrp - item.cutPrice) / item.mrp) * 100)
              );
              return (
                <article key={item.id} className="product-card wound-dressing-card">
                  {item.images[0] ? (
                    <img src={item.images[0]} alt={item.productDescription} className="db-medicine-image" />
                  ) : null}
                  <h3>{item.productDescription} – {item.itemCode}</h3>
                  <p className="muted">{item.brandName} · Size: {item.size} · UOM: {item.uom}</p>
                  <p className="discount-note">Save {discountPercent}% on MRP</p>
                  <div className="price-row">
                    <strong>₹{item.cutPrice.toFixed(2)}</strong>
                    <span>₹{item.mrp.toFixed(2)}</span>
                    <em>Best Price</em>
                  </div>
                  <ShopProductActions productType="dynamic" productId={item.id} />
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
