"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CartItem = {
  id: number;
  productName: string;
  productSubtitle: string;
  unitPrice: number;
  mrpPrice: number;
  quantity: number;
  lineTotal: number;
};

type CartResponse = {
  ok: boolean;
  cart: {
    items: CartItem[];
    subtotal: number;
  };
  pricing: {
    gstPercent: number;
    gstAmount: number;
    shippingAmount: number;
    total: number;
    freeShippingThreshold: number;
    isUdaipurPincode: boolean;
  };
  shippingNote: string;
};

export function CartClient() {
  const [loading, setLoading] = useState(true);
  const [pincode, setPincode] = useState("");
  const [data, setData] = useState<CartResponse | null>(null);
  const [error, setError] = useState("");

  async function refreshCart(nextPincode?: string) {
    try {
      setLoading(true);
      setError("");
      const resolvedPincode = nextPincode ?? pincode;
      const query = resolvedPincode ? `?pincode=${encodeURIComponent(resolvedPincode)}` : "";
      const response = await fetch(`/api/cart${query}`);
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "Unable to load cart.");
      }
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load cart.");
    } finally {
      setLoading(false);
    }
  }

  async function updateItem(action: "update" | "remove", itemId: number, quantity = 0) {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, itemId, quantity }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "Unable to update cart item.");
      }
      await refreshCart();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Unable to update cart item.");
    }
  }

  useEffect(() => {
    void refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => data?.pricing, [data]);

  return (
    <div className="content-page container split-grid">
      <section className="info-card">
        <h1>Your Cart</h1>
        <p className="muted">GST 5% is auto-applied. Enter pincode for instant shipping calculation.</p>

        <label>
          Delivery Pincode
          <input
            type="text"
            value={pincode}
            onChange={(event) => setPincode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            placeholder="Enter 6-digit pincode"
          />
        </label>
        <div className="hero__cta">
          <button type="button" className="btn btn-secondary" onClick={() => refreshCart(pincode)}>
            Verify Shipping
          </button>
        </div>

        {data?.shippingNote ? <p className="muted">{data.shippingNote}</p> : null}

        {loading ? <p className="muted">Loading cart...</p> : null}
        {error ? <p className="muted">{error}</p> : null}

        {!loading && !error && data?.cart.items.length === 0 ? (
          <div className="hero__cta">
            <p className="muted">Your cart is empty.</p>
            <Link href="/shop" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        ) : null}

        <div className="list-reset" role="list">
          {data?.cart.items.map((item) => (
            <article key={item.id} className="product-card" role="listitem">
              <h3>{item.productName}</h3>
              <p className="muted">{item.productSubtitle}</p>
              <div className="price-row">
                <strong>Rs. {item.unitPrice.toFixed(2)}</strong>
                <span>Rs. {item.mrpPrice.toFixed(2)}</span>
              </div>
              <div className="hero__cta">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => updateItem("update", item.id, item.quantity - 1)}
                >
                  <Minus size={14} />
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => updateItem("update", item.id, item.quantity + 1)}
                >
                  <Plus size={14} />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => updateItem("remove", item.id)}
                >
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
            <strong>Rs. {data?.cart.subtotal.toFixed(2) ?? "0.00"}</strong>
          </li>
          <li>
            <span>GST ({summary?.gstPercent ?? 5}%)</span>
            <strong>Rs. {summary?.gstAmount.toFixed(2) ?? "0.00"}</strong>
          </li>
          <li>
            <span>Shipping</span>
            <strong>{summary?.shippingAmount ? `Rs. ${summary.shippingAmount.toFixed(2)}` : "Free"}</strong>
          </li>
          <li>
            <span>Total Payable</span>
            <strong>Rs. {summary?.total.toFixed(2) ?? "0.00"}</strong>
          </li>
        </ul>
        <p className="muted">
          Free shipping above Rs. 2000, or above Rs. 1000 for Udaipur pincodes 313001-313005.
        </p>
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
