import Link from "next/link";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";

import { storeAddress } from "@/app/_data/products";

const quickLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>Tirupati Medix</h3>
          <p>
            Your reliable medicine partner for everyday wellness, chronic care, and authentic
            prescriptions.
          </p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <p>
            <MapPin size={16} />
            {storeAddress}
          </p>
          <p>
            <Phone size={16} /> +91 98290 00001
          </p>
          <p>
            <Mail size={16} /> care@tirupatimedix.com
          </p>
          <p>
            <Clock3 size={16} /> Mon - Sat: 9:00 AM to 9:30 PM
          </p>
        </div>
      </div>
      <div className="container footer-note">
        <p>Copyright {new Date().getFullYear()} Tirupati Medix. All rights reserved.</p>
      </div>
    </footer>
  );
}
