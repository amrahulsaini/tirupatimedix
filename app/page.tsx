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
          eyebrow="Ostomy Care"
          title="Explore By Category"
          subtitle="Browse our complete range of ostomy care and diagnostic products."
        />
        <div className="category-showcase">
          <Link href="/shop/hollister" className="showcase-card">
            <div className="showcase-card__image">
              <img src="/hollister-cat.webp" alt="Hollister Ostomy Care" />
            </div>
            <div className="showcase-card__label">
              <span>Hollister</span>
              <span className="showcase-card__arrow">&rarr;</span>
            </div>
          </Link>
          <Link href="/shop/meril-fully-automatic" className="showcase-card">
            <div className="showcase-card__image">
              <img src="/meril-fully-auto-cat.webp" alt="Meril Fully Automatic" />
            </div>
            <div className="showcase-card__label">
              <span>Meril Fully Auto</span>
              <span className="showcase-card__arrow">&rarr;</span>
            </div>
          </Link>
          <Link href="/shop/meril-semi-automatic" className="showcase-card">
            <div className="showcase-card__image">
              <img src="/meril-semi-auto-cat.webp" alt="Meril Semi Automatic" />
            </div>
            <div className="showcase-card__label">
              <span>Meril Semi Auto</span>
              <span className="showcase-card__arrow">&rarr;</span>
            </div>
          </Link>
          <Link href="/shop/dynamic-techno" className="showcase-card">
            <div className="showcase-card__image">
              <img src="/dynamic-techno-cat.webp" alt="Dynamic Techno Medicals" />
            </div>
            <div className="showcase-card__label">
              <span>Dynamic Techno</span>
              <span className="showcase-card__arrow">&rarr;</span>
            </div>
          </Link>
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
          <Link className="btn btn-primary" href="/shop/hollister">View All Hollister Products</Link>
        </div>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Meril Fully Automatic"
          title="Featured Meril Fully Automatic"
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
        </div>
        <div className="view-all-row">
          <Link className="btn btn-primary" href="/shop/meril-fully-automatic">View All Meril Fully Automatic Products</Link>
        </div>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Meril Semi Automatic"
          title="Featured Meril Semi Automatic"
          subtitle="Reliable semi-automated reagents for clinical diagnostics."
        />
        <div className="product-grid">
          {topMerilSemi.map((item) => (
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
        <div className="view-all-row">
          <Link className="btn btn-primary" href="/shop/meril-semi-automatic">View All Meril Semi Automatic Products</Link>
        </div>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Dynamic Techno"
          title="Featured Dynamic Techno Medicals"
          subtitle="NewMom & Sego maternity and post-operative care products."
        />
        <div className="product-grid">
          {topDynamicTechno.map((item) => (
            <article key={item.id} className="product-card dynamic-techno-card">
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
          <Link className="btn btn-primary" href="/shop/dynamic-techno">View All Dynamic Techno Products</Link>
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
