"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

const announcements = [
  "Free Shipping above ₹2000",
  "Delivery in 4 to 5 days",
  "100% genuine medical products",
  "Need help? Talk to a pharmacist at Contact",
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="top-strip" aria-label="Announcements">
        <div className="container top-strip__rotator">
          <div className="top-strip__rotator-track">
            {announcements.map((message, index) => (
              <span
                key={message}
                className="top-strip__item"
                style={{
                  ["--announcement-index" as string]: index,
                  ["--announcement-count" as string]: announcements.length,
                }}
              >
                {message}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="container nav-shell">
        <Link href="/" className="brand" onClick={() => setIsOpen(false)}>
          <span className="brand-mark">
            <Image
              src="/main-logo.webp"
              alt="Tirupati Medix"
              width={74}
              height={74}
              sizes="(max-width: 720px) 62px, 74px"
              priority
            />
          </span>
          <span>
            <strong>Tirupati Medix</strong>
            <small>tirupatimedix.com</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary Navigation">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <button type="button" aria-label="Search medicines">
            <Search size={18} />
          </button>
          <Link href="/cart" aria-label="View cart">
            <ShoppingCart size={18} />
          </Link>
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setIsOpen((current) => !current)}
            aria-expanded={isOpen}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div className={`mobile-nav ${isOpen ? "mobile-nav--open" : ""}`}>
        <div className="container mobile-nav__items">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/checkout" onClick={() => setIsOpen(false)}>
            Checkout
          </Link>
        </div>
      </div>
    </header>
  );
}
