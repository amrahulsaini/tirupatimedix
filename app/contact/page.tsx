import type { Metadata } from "next";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";

import { storeAddress } from "@/app/_data/products";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Tirupati Medix for medicine support and order help.",
};

export default function ContactPage() {
  return (
    <div className="content-page container split-grid">
      <section className="info-card">
        <h1>Contact Us</h1>
        <p className="muted">
          Reach out for order support, prescription queries, or bulk medicine requirements.
        </p>
        <form className="list-reset" action="#">
          <label>
            Name
            <input type="text" placeholder="Your name" />
          </label>
          <label>
            Mobile Number
            <input type="tel" placeholder="+91" />
          </label>
          <label>
            Message
            <textarea rows={4} placeholder="Write your query" />
          </label>
          <button type="submit" className="btn btn-primary">
            Send Message
          </button>
        </form>
      </section>

      <aside className="info-card">
        <h3>Store Details</h3>
        <ul className="list-reset">
          <li>
            <MapPin size={16} /> {storeAddress}
          </li>
          <li>
            <Phone size={16} /> +91 98290 00001
          </li>
          <li>
            <Mail size={16} /> care@tirupatimedix.com
          </li>
          <li>
            <Clock3 size={16} /> Mon - Sat: 9:00 AM to 7:30 PM
          </li>
        </ul>
      </aside>
    </div>
  );
}
