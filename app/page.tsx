import Link from "next/link";
import { Ambulance, BadgePercent, CheckCheck, ShieldCheck, Truck } from "lucide-react";

import { ProductCard } from "@/app/_components/product-card";
import { SectionTitle } from "@/app/_components/section-title";
import { categories, featuredSlugs, products, storeAddress } from "@/app/_data/products";

export default function Home() {
  const featuredSet = new Set<string>(featuredSlugs);
  const featuredProducts = products.filter((product) => featuredSet.has(product.slug));

  return (
    <div className="landing-page">
      <section className="hero container">
        <div className="hero__content">
          <p className="hero__eyebrow">India Trusted Medicine Marketplace</p>
          <h1>Healthcare essentials delivered with pharmacy-grade trust.</h1>
          <p>
            Tirupati Medix brings authentic medicines, wellness products, and verified care from
            licensed suppliers directly to your doorstep.
          </p>
          <div className="hero__cta">
            <Link href="/shop" className="btn btn-primary">
              Shop Medicines
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Upload Prescription
            </Link>
          </div>
          <div className="hero__stats">
            <span>
              <ShieldCheck size={16} /> 100% Genuine Products
            </span>
            <span>
              <Truck size={16} /> Same Day Dispatch
            </span>
            <span>
              <Ambulance size={16} /> Emergency Support Line
            </span>
          </div>
        </div>
        <div className="hero__panel">
          <h3>Why families trust Tirupati Medix</h3>
          <ul>
            <li>
              <CheckCheck size={18} /> Quality-checked inventory from approved distributors.
            </li>
            <li>
              <CheckCheck size={18} /> Temperature-safe storage and handling process.
            </li>
            <li>
              <CheckCheck size={18} /> Dedicated support for repeat and chronic prescriptions.
            </li>
          </ul>
          <p>{storeAddress}</p>
        </div>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Shop by Category"
          title="Everything Your Health Journey Needs"
          subtitle="From everyday wellness to long-term care, curated by our pharmacy experts."
        />
        <div className="category-grid">
          {categories.map((category) => (
            <article key={category.name} className="category-card">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <Link href="/shop">Explore</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <SectionTitle
          eyebrow="Featured Medicines"
          title="Popular Choices at Better Value"
          subtitle="Verified brands, transparent pricing, and quick doorstep delivery."
        />
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="container section promo-strip">
        <div>
          <BadgePercent size={20} />
          <h3>Save up to 22% on monthly essentials</h3>
          <p>Setup recurring orders for diabetes, cardiac, and vitamin medicines.</p>
        </div>
        <Link className="btn btn-primary" href="/checkout">
          Start Subscription
        </Link>
      </section>
    </div>
  );
}
