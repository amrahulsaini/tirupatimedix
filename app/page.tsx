import Link from "next/link";
import { BadgePercent } from "lucide-react";

import { SectionTitle } from "@/app/_components/section-title";
import { getAllMerilProducts } from "@/lib/meril";
import { getAllMedicines } from "@/lib/medicines";

export const dynamic = "force-dynamic";

export default async function Home() {
  const medicines = await getAllMedicines().catch(() => []);
  const merilProducts = await getAllMerilProducts().catch(() => []);

  const topHollister = medicines.slice(0, 6);
  const topMeril = merilProducts.slice(0, 6);
  const totalProducts = medicines.length + merilProducts.length;
  const firstMedicineImage = medicines.find((item) => item.images[0])?.images[0] ?? "/tirupati-medix-logo.webp";
  const merilCategoryImage =
    medicines.find(
      (item) => item.images[0] && item.category.toLowerCase().includes("meril")
    )?.images[0] ?? null;

  return (
    <div className="landing-page">
      <section className="home-banner-full">
        <picture>
          <source media="(max-width: 768px)" srcSet="/tirupati-banner-mobile.png" />
          <img
            src="/tirupati-medix-banner-desktop.webp"
            alt="Tirupati Medix Banner"
            className="home-banner__image"
          />
        </picture>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Catalog Paths"
          title="Explore By Category"
          subtitle="Handpicked category entrances to quickly browse products and pricing."
        />
        <div className="category-grid">
          <article className="category-card">
            <div className="category-card__media">
              <img src={firstMedicineImage} alt="Hollister category preview" />
            </div>
            <h3>Hollister</h3>
            <p>{medicines.length} products currently available.</p>
            <Link href="/shop">Explore</Link>
          </article>
          <article className="category-card">
            {merilCategoryImage ? (
              <div className="category-card__media">
                <img src={merilCategoryImage} alt="Meril category preview" />
              </div>
            ) : null}
            <h3>Meril Fully Automatic</h3>
            <p>{merilProducts.length} products currently available.</p>
            <Link href="/shop">Explore</Link>
          </article>
          <article className="category-card">
            <div className="category-card__media">
              <img src={firstMedicineImage} alt="Unified catalog preview" />
            </div>
            <h3>Unified Ostomy Care View</h3>
            <p>Single storefront view with MRP strike-through and final cut price.</p>
            <Link href="/shop">Open Catalog</Link>
          </article>
        </div>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Hollister"
          title="Featured Hollister Selection"
          subtitle="Essential picks with transparent pricing and quick-compare display."
        />
        <div className="product-grid">
          {topHollister.map((item) => (
            <article key={item.id} className="product-card">
              <div className="product-card__badge-row">
                <span className="pill">Code: {item.code}</span>
                <span className="stock stock--ok">Pack: {item.packingPerBox}</span>
              </div>
              {item.images[0] ? (
                <img src={item.images[0]} alt={item.genericName} className="db-medicine-image" />
              ) : null}
              <h3>{item.genericName}</h3>
              <div className="price-row">
                <strong>Rs. {item.cutPrice.toFixed(2)}</strong>
                <span>Rs. {item.mrpUnits.toFixed(2)}</span>
                <em>Best Price</em>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Meril"
          title="Featured Meril Selection"
          subtitle="Precision-focused devices curated for clinics and hospital workflows."
        />
        <div className="product-grid">
          {topMeril.map((item) => (
            <article key={item.id} className="product-card meril-card">
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

      {totalProducts === 0 ? (
        <section className="container section info-card">
          <h2>No products available right now</h2>
          <p className="muted">Please add catalog items from the admin panel and refresh.</p>
        </section>
      ) : null}

      <section className="container section promo-strip">
        <div>
          <BadgePercent size={20} />
          <h3>Unified professional catalog</h3>
          <p>Manage both Hollister and Meril ranges from one streamlined admin workflow.</p>
        </div>
        <Link className="btn btn-primary" href="/admin">
          Manage Catalog
        </Link>
      </section>
    </div>
  );
}
