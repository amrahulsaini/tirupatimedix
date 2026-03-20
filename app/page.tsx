import Link from "next/link";
import { Ambulance, BadgePercent, CheckCheck, ShieldCheck, Truck } from "lucide-react";

import { SectionTitle } from "@/app/_components/section-title";
import { storeAddress } from "@/app/_data/products";
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
      <section className="hero container">
        <div className="hero__content">
          <p className="hero__eyebrow">Ostomy Care and Diagnostic Catalog</p>
          <h1>Medical products managed directly from your live database.</h1>
          <p>
            Tirupati Medix showcases Hollister and Meril Fully Automatic products with real pricing
            and categories from your MySQL tables.
          </p>
          <div className="hero__cta">
            <Link href="/shop" className="btn btn-primary">
              Shop Catalog
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Contact Support
            </Link>
          </div>
          <div className="hero__stats">
            <span>
              <ShieldCheck size={16} /> 100% Genuine Products
            </span>
            <span>
              <Truck size={16} /> {totalProducts} Products Listed
            </span>
            <span>
              <Ambulance size={16} /> Emergency Support Line
            </span>
          </div>
        </div>
        <div className="hero__panel">
          <h3>Why teams trust Tirupati Medix</h3>
          <ul>
            <li>
              <CheckCheck size={18} /> Live database-driven catalog for real product management.
            </li>
            <li>
              <CheckCheck size={18} /> Admin updates instantly reflected on storefront pages.
            </li>
            <li>
              <CheckCheck size={18} /> Structured product pricing with MRP and final cut price.
            </li>
          </ul>
          <p>{storeAddress}</p>
        </div>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Ostomy Care Categories"
          title="Live Categories From Database"
          subtitle="Both primary catalogs are included in one managed storefront flow."
        />
        <div className="category-grid">
          <article className="category-card">
            <h3>Hollister</h3>
            <p>{medicines.length} products available in Hollister table.</p>
            <Link href="/shop">Explore</Link>
          </article>
          <article className="category-card">
            <h3>Meril Fully Automatic</h3>
            <p>{merilProducts.length} products available in Meril table.</p>
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
          subtitle="Code and generic name with cut price and MRP from live table."
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
          <h2>No products found in database</h2>
          <p className="muted">Please run your SQL inserts and refresh the homepage.</p>
        </section>
      ) : null}

      <section className="container section promo-strip">
        <div>
          <BadgePercent size={20} />
          <h3>Live database catalog enabled</h3>
          <p>Manage both Hollister and Meril products from admin and show instantly on storefront.</p>
        </div>
        <Link className="btn btn-primary" href="/admin">
          Manage Catalog
        </Link>
      </section>
    </div>
  );
}
