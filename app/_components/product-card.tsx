import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";

import type { Product } from "@/app/_data/products";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <article className="product-card">
      <div className="product-card__badge-row">
        <span className="pill">{product.category}</span>
        <span className={product.inStock ? "stock stock--ok" : "stock stock--out"}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>
      <h3>{product.name}</h3>
      <p className="muted">Strength: {product.strength}</p>
      <div className="rating-row">
        <Star size={16} />
        <span>
          {product.rating} ({product.reviews} reviews)
        </span>
      </div>
      <p className="description">{product.description}</p>
      <div className="price-row">
        <strong>Rs. {product.price}</strong>
        <span>Rs. {product.mrp}</span>
        <em>{discount}% OFF</em>
      </div>
      <div className="product-card__actions">
        <Link href={`/shop/${product.slug}`} className="btn btn-secondary">
          View Details
        </Link>
        <button type="button" className="btn btn-primary" disabled={!product.inStock}>
          <ShieldCheck size={16} />
          {product.inStock ? "Add to Cart" : "Notify Me"}
        </button>
      </div>
    </article>
  );
}
