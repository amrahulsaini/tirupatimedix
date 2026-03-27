import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionTitle } from "@/app/_components/section-title";
import { ShopProductActions } from "@/app/_components/shop-product-actions";
import { getAllMerilProducts } from "@/lib/meril";
import { getAllMerilSemiProducts } from "@/lib/meril-semi";
import { getAllMedicines } from "@/lib/medicines";
import { getAllDynamicTechnoProducts } from "@/lib/dynamic-techno";

export const dynamic = "force-dynamic";

const CATEGORY_META: Record<string, { title: string; eyebrow: string; description: string }> = {
  "ostomy-care": {
    title: "Ostomy Care Products",
    eyebrow: "Ostomy Care",
    description: "Browse all ostomy care products with transparent pricing.",
  },
  "pathology-products": {
    title: "Pathology Products",
    eyebrow: "Pathology",
    description: "Fully automatic and semi-automatic reagents for labs and hospitals.",
  },
  "wound-dressing": {
    title: "Wound Dressing Products",
    eyebrow: "Wound Dressing",
    description: "Sterizone, NewMom & Sego wound care and post-operative products.",
  },
};

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const meta = CATEGORY_META[category];
  if (!meta) return { title: "Category Not Found" };
  return { title: meta.title, description: meta.description };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const meta = CATEGORY_META[category];
  if (!meta) notFound();

  return (
    <div className="content-page container">
      <div className="content-hero">
        <h1>{meta.title}</h1>
        <p>{meta.description}</p>
      </div>

      <nav className="section filter-bar">
        <p>Categories</p>
        <div className="filter-chips">
          <Link href="/shop" className="filter-chip">All Categories</Link>
          {Object.entries(CATEGORY_META).map(([key, val]) => (
            <Link
              key={key}
              href={`/shop/${key}`}
              className={`filter-chip ${category === key ? "filter-chip--active" : ""}`}
            >
              {val.title.replace(" Products", "")}
            </Link>
          ))}
        </div>
      </nav>

      {category === "ostomy-care" && <OstomyCareSection />}
      {category === "pathology-products" && <PathologySection />}
      {category === "wound-dressing" && <WoundDressingSection />}
    </div>
  );
}

async function OstomyCareSection() {
  const medicines = await getAllMedicines().catch(() => []);
  if (medicines.length === 0) {
    return (
      <section className="section info-card">
        <h2>No Ostomy Care products found</h2>
        <p className="muted">Check back soon or try another category.</p>
      </section>
    );
  }

  const categories = [...new Set(medicines.map((item) => item.category))];

  return (
    <>
      {categories.map((cat) => {
        const items = medicines.filter((item) => item.category === cat);
        return (
          <section className="section" key={cat}>
            <SectionTitle
              eyebrow="Ostomy Care"
              title={cat}
              subtitle={`${items.length} products available`}
            />
            <div className="product-grid">
              {items.map((item) => {
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
      })}
    </>
  );
}

async function PathologySection() {
  const [fullProducts, semiProducts] = await Promise.all([
    getAllMerilProducts().catch(() => []),
    getAllMerilSemiProducts().catch(() => []),
  ]);

  if (fullProducts.length === 0 && semiProducts.length === 0) {
    return (
      <section className="section info-card">
        <h2>No Pathology products found</h2>
        <p className="muted">Check back soon or try another category.</p>
      </section>
    );
  }

  return (
    <>
      {fullProducts.length > 0 && (
        <section className="section">
          <SectionTitle
            eyebrow="Pathology"
            title="Fully Automatic Reagents"
            subtitle={`${fullProducts.length} products available`}
          />
          <div className="product-grid">
            {fullProducts.map((item) => {
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
      )}

      {semiProducts.length > 0 && (
        <section className="section">
          <SectionTitle
            eyebrow="Pathology"
            title="Semi Automatic Reagents"
            subtitle={`${semiProducts.length} products available`}
          />
          <div className="product-grid">
            {semiProducts.map((item) => {
              const discountPercent = Math.max(
                0,
                Math.round(((item.mrpUnits - item.cutPrice) / item.mrpUnits) * 100)
              );
              return (
                <article key={`semi-${item.id}`} className="product-card meril-card meril-semi-card">
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
      )}
    </>
  );
}

async function WoundDressingSection() {
  const products = await getAllDynamicTechnoProducts().catch(() => []);
  if (products.length === 0) {
    return (
      <section className="section info-card">
        <h2>No Wound Dressing products found</h2>
        <p className="muted">Check back soon or try another category.</p>
      </section>
    );
  }

  return (
    <section className="section">
      <SectionTitle
        eyebrow="Wound Dressing"
        title="Wound Dressing Products"
        subtitle={`${products.length} products available`}
      />
      <div className="product-grid">
        {products.map((item) => {
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
  );
}
