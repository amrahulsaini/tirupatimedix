import type { MetadataRoute } from "next";

import { products } from "@/app/_data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://tirupatimedix.com";

  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/cart",
    "/checkout",
    "/faq",
    "/privacy-policy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/shop/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
