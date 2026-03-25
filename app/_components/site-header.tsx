"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogOut, Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

const announcements = [
  "Free Shipping above ₹2000",
  "Udaipur (313001-313005): Free Shipping above ₹1000",
  "Delivery in 4 to 5 days",
  "100% genuine medical products",
  "Need help? Talk to a pharmacist at Contact",
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const currentSearchQuery = (pathname === "/" || pathname === "/search") ? (searchParams.get("q") ?? "") : "";

  useEffect(() => {
    async function fetchMe() {
      const response = await fetch("/api/auth/me");
      const result = await response.json();
      setIsAuthenticated(Boolean(result.authenticated));
    }

    void fetchMe();
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    searchInputRef.current?.focus();
  }, [isSearchOpen]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAuthenticated(false);
    setIsOpen(false);
    window.location.href = "/";
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setIsSearchOpen(false);
      router.push("/");
      return;
    }

    router.push(`/?q=${encodeURIComponent(query)}#search-results`);
    setIsSearchOpen(false);
    setIsOpen(false);
  }

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
          <button
            type="button"
            className={`header-search-toggle ${isSearchOpen ? "header-search-toggle--active" : ""}`}
            aria-label={isSearchOpen ? "Close product search" : "Open product search"}
            aria-expanded={isSearchOpen}
            onClick={() => {
              if (!isSearchOpen && !searchQuery.trim() && currentSearchQuery) {
                setSearchQuery(currentSearchQuery);
              }
              setIsSearchOpen((current) => !current);
            }}
          >
            <Search size={18} />
          </button>
          <form
            className={`header-search ${isSearchOpen ? "header-search--open" : ""}`}
            role="search"
            onSubmit={handleSearchSubmit}
          >
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search by code or name"
              aria-label="Search products"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button type="submit" aria-label="Search medicines">
              <Search size={16} />
            </button>
          </form>
          <Link href="/account" aria-label="Profile login">
            <UserRound size={18} />
          </Link>
          <Link href="/cart" aria-label="View cart">
            <ShoppingCart size={18} />
          </Link>
          {isAuthenticated ? (
            <button type="button" aria-label="Logout" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          ) : null}
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
          <Link href="/account" onClick={() => setIsOpen(false)}>
            Profile Login
          </Link>
          {isAuthenticated ? (
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
