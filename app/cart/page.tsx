import type { Metadata } from "next";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { products } from "@/app/_data/products";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review selected medicine items before checkout.",
};

const cartItems = [products[0], products[3], products[8]];

export default function CartPage() {
  const subtotal = cartItems.reduce((sum, product) => sum + product.price, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  return (
    <div className="content-page container split-grid">
      <section className="info-card">
        <h1>Your Cart</h1>
        <p className="muted">Review selected medicines before checkout.</p>
        <div className="list-reset" role="list">
          {cartItems.map((item) => (
            <article key={item.id} className="product-card" role="listitem">
              <div className="product-card__badge-row">
                <strong>{item.name}</strong>
                <span>Rs. {item.price}</span>
              </div>
              <p className="muted">{item.category}</p>
              <div className="hero__cta">
                <button type="button" className="btn btn-secondary">
                  <Minus size={14} />
                </button>
                <span>1</span>
                <button type="button" className="btn btn-secondary">
                  <Plus size={14} />
                </button>
                <button type="button" className="btn btn-secondary">
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="info-card">
        <h3>Order Summary</h3>
        <ul className="list-reset">
          <li>
            <span>Subtotal</span>
            <strong>Rs. {subtotal}</strong>
          </li>
          <li>
            <span>Shipping</span>
            <strong>{shipping === 0 ? "Free" : `Rs. ${shipping}`}</strong>
          </li>
          <li>
            <span>Total Payable</span>
            <strong>Rs. {total}</strong>
          </li>
        </ul>
        <div className="hero__cta">
          <Link href="/checkout" className="btn btn-primary">
            Proceed to Checkout
          </Link>
          <Link href="/shop" className="btn btn-secondary">
            Add More Items
          </Link>
        </div>
      </aside>
    </div>
  );
}
