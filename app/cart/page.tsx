import type { Metadata } from "next";
import { CartClient } from "@/app/_components/cart-client";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review cart items with GST and shipping calculation before checkout.",
};

export default function CartPage() {
  return <CartClient />;
}
