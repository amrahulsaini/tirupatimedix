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
          eyebrow="Ostomy Care Categories"
          title="Specialized Categories"
          subtitle="Both primary catalogs are included in one managed storefront flow."
        />
        <div className="category-grid">
          <article className="category-card">
            <h3>Hollister</h3>
            <p>{medicines.length} products currently available.</p>
            <Link href="/shop">Explore</Link>
          </article>
          <article className="category-card">
            <h3>Meril Fully Automatic</h3>
            <p>{merilProducts.length} products currently available.</p>
            <Link href="/shop">Explore</Link>
          </article>
          <article className="category-card">
            <h3>Unified Ostomy Care View</h3>
            <p>Single storefront view with MRP strike-through and final cut price.</p>
            <Link href="/shop">Open Catalog</Link>
          </article>
        </div>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Hollister"
          title="Hollister Product Highlights"
          subtitle="Code and generic name with best price and MRP details."
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
          title="Meril Fully Automatic Highlights"
          subtitle="Product name and pack size with final cut pricing."
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
