import type { Metadata } from "next";
import { CircleCheckBig } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Tirupati Medix and our pharmacy-first care approach.",
};

export default function AboutPage() {
  return (
    <div className="content-page container split-grid">
      <section className="content-hero">
        <h1>About Tirupati Medix</h1>
        <p>
          Tirupati Medix is a medicine-focused ecommerce platform built to make healthcare access
          simpler, safer, and faster for families in Udaipur and across India.
        </p>
        <p>
          Our process combines pharmacy expertise, quality verification, and customer support so
          every order meets the highest standards.
        </p>
      </section>

      <aside className="info-card">
        <h3>What we stand for</h3>
        <ul className="list-reset">
          <li>
            <CircleCheckBig size={16} /> Genuine products from approved channels.
          </li>
          <li>
            <CircleCheckBig size={16} /> Transparent pricing with regular health offers.
          </li>
          <li>
            <CircleCheckBig size={16} /> Responsible medicine guidance and service.
          </li>
          <li>
            <CircleCheckBig size={16} /> Prompt support for recurring prescriptions.
          </li>
        </ul>
      </aside>
    </div>
  );
}
