import Link from "next/link";

import { SectionTitle } from "@/app/_components/section-title";
import { getAllMerilProducts } from "@/lib/meril";
import { getAllMerilSemiProducts } from "@/lib/meril-semi";
import { getAllMedicines } from "@/lib/medicines";
import { getAllDynamicTechnoProducts } from "@/lib/dynamic-techno";

export const dynamic = "force-dynamic";

export default async function Home() {
  const medicines = await getAllMedicines().catch(() => []);
  const merilProducts = await getAllMerilProducts().catch(() => []);
  const merilSemiProducts = await getAllMerilSemiProducts().catch(() => []);
  const dynamicTechnoProducts = await getAllDynamicTechnoProducts().catch(() => []);

  const topHollister = medicines.slice(0, 6);
  const topMeril = merilProducts.slice(0, 6);
  const topMerilSemi = merilSemiProducts.slice(0, 6);
  const topDynamicTechno = dynamicTechnoProducts.slice(0, 6);
  const totalProducts = medicines.length + merilProducts.length + merilSemiProducts.length + dynamicTechnoProducts.length;

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
          eyebrow="Medical Supplies"
          title="Explore By Category"
          subtitle="Browse our complete range of ostomy care, pathology, and wound dressing products."
        />
        <div className="category-showcase">
          <Link href="/shop/ostomy-care" className="showcase-card">
            <div className="showcase-card__image">
              <img src="/ostomy-care-cat.webp" alt="Ostomy Care Products" />
            </div>
            <div className="showcase-card__label">
              <span>Ostomy Care</span>
              <span className="showcase-card__arrow">&rarr;</span>
            </div>
          </Link>
          <Link href="/shop/pathology-products" className="showcase-card">
            <div className="showcase-card__image">
              <img src="/pathology-products-cat.webp" alt="Pathology Products" />
            </div>
            <div className="showcase-card__label">
              <span>Pathology Products</span>
              <span className="showcase-card__arrow">&rarr;</span>
            </div>
          </Link>
          <Link href="/shop/wound-dressing" className="showcase-card">
            <div className="showcase-card__image">
              <img src="/wound-dressing-cat.webp" alt="Wound Dressing Products" />
            </div>
            <div className="showcase-card__label">
              <span>Wound Dressing</span>
              <span className="showcase-card__arrow">&rarr;</span>
            </div>
          </Link>
        </div>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Ostomy Care"
          title="Featured Ostomy Care Products"
          subtitle="Essential picks with transparent pricing and quick-compare display."
        />
        <div className="product-grid">
          {topHollister.map((item) => (
            <article key={item.id} className="product-card">
              <div className="product-card__badge-row">
                <span className="stock stock--ok">Pack: {item.packingPerBox}</span>
              </div>
              {item.images[0] ? (
                <img src={item.images[0]} alt={item.genericName} className="db-medicine-image" />
              ) : null}
              <h3>{item.genericName} – {item.code}</h3>
              <div className="price-row">
                <strong>₹{item.cutPrice.toFixed(2)}</strong>
                <span>₹{item.mrpUnits.toFixed(2)}</span>
                <em>Best Price</em>
              </div>
            </article>
          ))}
        </div>
        <div className="view-all-row">
          <Link className="btn btn-primary" href="/shop/ostomy-care">View All Ostomy Care Products</Link>
        </div>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Pathology"
          title="Featured Pathology Products"
          subtitle="Precision-focused reagents curated for labs and hospital workflows."
        />
        <div className="product-grid">
          {topMeril.map((item) => (
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
          {topMerilSemi.map((item) => (
            <article key={`semi-${item.id}`} className="product-card meril-card meril-semi-card">
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
        <div className="view-all-row">
          <Link className="btn btn-primary" href="/shop/pathology-products">View All Pathology Products</Link>
        </div>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Wound Dressing"
          title="Featured Wound Dressing Products"
          subtitle="Sterizone, NewMom & Sego wound care and post-operative products."
        />
        <div className="product-grid">
          {topDynamicTechno.map((item) => (
            <article key={item.id} className="product-card wound-dressing-card">
              {item.images[0] ? (
                <img src={item.images[0]} alt={item.productDescription} className="db-medicine-image" />
              ) : null}
              <h3>{item.productDescription} – {item.itemCode}</h3>
              <p className="muted">{item.brandName} · Size: {item.size}</p>
              <div className="price-row">
                <strong>₹{item.cutPrice.toFixed(2)}</strong>
                <span>₹{item.mrp.toFixed(2)}</span>
                <em>Best Price</em>
              </div>
            </article>
          ))}
        </div>
        <div className="view-all-row">
          <Link className="btn btn-primary" href="/shop/wound-dressing">View All Wound Dressing Products</Link>
        </div>
      </section>

      {totalProducts === 0 ? (
        <section className="container section info-card">
          <h2>No products available right now</h2>
          <p className="muted">Please add catalog items from the admin panel and refresh.</p>
        </section>
      ) : null}

    </div>
  );
}
