import type { Metadata } from "next";
import { CreditCard, ShieldCheck, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Securely place your medicine order with Tirupati Medix.",
};

export default function CheckoutPage() {
  return (
    <div className="content-page container split-grid">
      <section className="info-card">
        <h1>Checkout</h1>
        <p className="muted">
          Complete your order with delivery details. Prescription medicines are dispatched after
          verification.
        </p>
        <form className="list-reset" action="#">
          <label>
            Full Name
            <input type="text" name="name" placeholder="Enter full name" />
          </label>
          <label>
            Mobile Number
            <input type="tel" name="phone" placeholder="+91" />
          </label>
          <label>
            Delivery Address
            <textarea name="address" rows={4} placeholder="House no, lane, area, city" />
          </label>
          <label>
            Upload Prescription Link (optional)
            <input type="url" name="prescription" placeholder="https://" />
          </label>
          <button type="submit" className="btn btn-primary">
            Place Order
          </button>
        </form>
      </section>

      <aside className="info-card">
        <h3>Payment & Security</h3>
        <ul className="list-reset">
          <li>
            <CreditCard size={16} /> UPI, cards, and cash on delivery options available.
          </li>
          <li>
            <ShieldCheck size={16} /> Secure checkout with protected customer data.
          </li>
          <li>
            <Truck size={16} /> Fast dispatch and live support for every order.
          </li>
        </ul>
      </aside>
    </div>
  );
}
