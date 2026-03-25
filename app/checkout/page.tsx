import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutClient } from "@/app/_components/checkout-client";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Securely place your medicine order with OTP verification and Razorpay.",
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutClient />
    </Suspense>
  );
}
