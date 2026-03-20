import type { Metadata } from "next";
import { DM_Serif_Display, Space_Grotesk } from "next/font/google";

import { SiteFooter } from "@/app/_components/site-footer";
import { SiteHeader } from "@/app/_components/site-header";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tirupatimedix.com"),
  title: {
    default: "Tirupati Medix | Online Medicine Store",
    template: "%s | Tirupati Medix",
  },
  description:
    "Buy authentic medicines, wellness essentials, and health care products online from Tirupati Medix.",
  keywords: [
    "tirupatimedix",
    "medicine store",
    "online pharmacy udaipur",
    "healthcare products",
    "prescription medicines",
  ],
  openGraph: {
    title: "Tirupati Medix",
    description: "Your trusted source for medicines and wellness products.",
    url: "https://tirupatimedix.com",
    siteName: "Tirupati Medix",
    images: [
      {
        url: "/tirupati-medix-logo.webp",
        width: 1200,
        height: 630,
        alt: "Tirupati Medix",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSerifDisplay.variable}`}>
      <body>
        <SiteHeader />
        <main className="page-main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
