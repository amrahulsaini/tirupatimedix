import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionTitle } from "@/app/_components/section-title";
import { getAllMerilProducts } from "@/lib/meril";
import { getAllMerilSemiProducts } from "@/lib/meril-semi";
import { getAllMedicines } from "@/lib/medicines";
import { getAllDynamicTechnoProducts } from "@/lib/dynamic-techno";

export const dynamic = "force-dynamic";

const CATEGORY_META: Record<string, { title: string; eyebrow: string; description: string }> = {
  hollister: {
    title: "Hollister Products",
    eyebrow: "Hollister",
    description: "Browse all Hollister ostomy care products with transparent pricing.",
  },
  "meril-fully-automatic": {
    title: "Meril Fully Automatic Products",
    eyebrow: "Meril",
    description: "Precision-focused fully automatic reagents for labs and hospitals.",
  },
  "meril-semi-automatic": {
    title: "Meril Semi Automatic Products",
    eyebrow: "Meril",
    description: "Reliable semi-automated reagents for clinical diagnostics.",
  },
  "dynamic-techno": {
    title: "Dynamic Techno Medicals",
    eyebrow: "Dynamic Techno",
    description: "Browse NewMom & Sego maternity and post-operative care products.",
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

      {category === "hollister" && <HollisterSection />}
      {category === "meril-fully-automatic" && <MerilFullSection />}
      {category === "meril-semi-automatic" && <MerilSemiSection />}
      {category === "dynamic-techno" && <DynamicTechnoSection />}
    </div>
  );
}

async function HollisterSection() {
  const medicines = await getAllMedicines().catch(() => []);
  if (medicines.length === 0) {
    return (
      <section className="section info-card">
        <h2>No Hollister products found</h2>
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
              eyebrow="Hollister"
              title={cat}
              subtitle={`${items.length} products available`}
            />
            <div className="product-grid">
              {items.map((item) => (
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
      })}
    </>
  );
}

async function MerilFullSection() {
  const products = await getAllMerilProducts().catch(() => []);
  if (products.length === 0) {
    return (
      <section className="section info-card">
        <h2>No Meril Fully Automatic products found</h2>
        <p className="muted">Check back soon or try another category.</p>
      </section>
    );
  }

  return (
    <section className="section">
      <SectionTitle
        eyebrow="Meril"
        title="Meril Fully Automatic"
        subtitle={`${products.length} products available`}
      />
      <div className="product-grid">
        {products.map((item) => (
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
  );
}

async function MerilSemiSection() {
  const products = await getAllMerilSemiProducts().catch(() => []);
  if (products.length === 0) {
    return (
      <section className="section info-card">
        <h2>No Meril Semi Automatic products found</h2>
        <p className="muted">Check back soon or try another category.</p>
      </section>
    );
  }

  return (
    <section className="section">
      <SectionTitle
        eyebrow="Meril"
        title="Meril Semi Automatic"
        subtitle={`${products.length} products available`}
      />
      <div className="product-grid">
        {products.map((item) => (
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
  );
}

async function DynamicTechnoSection() {
  const products = await getAllDynamicTechnoProducts().catch(() => []);
  if (products.length === 0) {
    return (
      <section className="section info-card">
        <h2>No Dynamic Techno Medicals products found</h2>
        <p className="muted">Check back soon or try another category.</p>
      </section>
    );
  }

  return (
    <section className="section">
      <SectionTitle
        eyebrow="Dynamic Techno"
        title="Dynamic Techno Medicals"
        subtitle={`${products.length} products available`}
      />
      <div className="product-grid">
        {products.map((item) => (
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
  );
}
