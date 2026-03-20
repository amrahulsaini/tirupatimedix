import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ShieldCheck, Star, Truck } from "lucide-react";

import { products } from "@/app/_data/products";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="content-page container split-grid">
      <article className="info-card">
        <span className="pill">{product.category}</span>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p className="muted">Strength: {product.strength}</p>
        <div className="rating-row">
          <Star size={16} />
          <span>
            {product.rating} ({product.reviews} verified ratings)
          </span>
        </div>
        <ul>
          <li>Take medicines only as advised by a registered physician.</li>
          <li>Always read label and package instructions before use.</li>
          <li>Contact support in case of side effects or dosage concerns.</li>
        </ul>
      </article>

      <aside className="info-card">
        <h3>Price & Delivery</h3>
        <div className="price-row">
          <strong>Rs. {product.price}</strong>
          <span>Rs. {product.mrp}</span>
          <em>{discount}% OFF</em>
        </div>
        <p className={product.inStock ? "stock stock--ok" : "stock stock--out"}>
          {product.inStock ? "In stock and ready to dispatch" : "Currently unavailable"}
        </p>
        <p>
          <Truck size={16} /> Standard delivery in 24-48 hours in serviceable locations.
        </p>
        <p>
          <ShieldCheck size={16} /> 100% quality check and secure packed medicine dispatch.
        </p>
        <p>
          <Check size={16} /> {product.usage}
        </p>
        <div className="hero__cta">
          <button type="button" className="btn btn-primary" disabled={!product.inStock}>
            Add to Cart
          </button>
          <Link className="btn btn-secondary" href="/shop">
            Continue Shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}
