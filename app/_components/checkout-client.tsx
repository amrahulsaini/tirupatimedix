"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";

import { AuthEmailOtp } from "@/app/_components/auth-email-otp";

type MeResponse = {
  authenticated: boolean;
  user?: { email: string };
};

type CartSummary = {
  subtotal: number;
  pricing: {
    gstPercent: number;
    gstAmount: number;
    shippingAmount: number;
    total: number;
    isUdaipurPincode: boolean;
  };
  shippingMessage: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export function CheckoutClient() {
  const [authenticatedEmail, setAuthenticatedEmail] = useState<string | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [pincode, setPincode] = useState("");
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    addressLine: "",
    city: "Udaipur",
    state: "Rajasthan",
    notes: "",
  });

  const canPay = useMemo(() => {
    return (
      !!authenticatedEmail &&
      !!form.customerName.trim() &&
      !!form.phone.trim() &&
      !!form.addressLine.trim() &&
      !!form.city.trim() &&
      !!form.state.trim() &&
      pincode.length === 6
    );
  }, [authenticatedEmail, form, pincode]);

  async function fetchMe() {
    try {
      setLoadingMe(true);
      const response = await fetch("/api/auth/me");
      const result = (await response.json()) as MeResponse;
      if (result.authenticated && result.user?.email) {
        setAuthenticatedEmail(result.user.email);
      }
    } finally {
      setLoadingMe(false);
    }
  }

  async function verifyShipping(nextPincode: string) {
    if (nextPincode.length < 6) {
      return;
    }

    const response = await fetch("/api/checkout/shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pincode: nextPincode }),
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      setStatusMessage(result.message ?? "Unable to verify shipping.");
      return;
    }

    setCartSummary({
      subtotal: Number(result.subtotal),
      pricing: result.pricing,
      shippingMessage: result.shippingMessage,
    });
    setStatusMessage(result.shippingMessage);
  }

  async function handlePayNow() {
    if (!canPay) {
      setStatusMessage("Please complete email verification and all checkout details.");
      return;
    }

    if (!window.Razorpay) {
      setStatusMessage("Razorpay script did not load. Please refresh the page.");
      return;
    }

    try {
      setLoadingOrder(true);
      setStatusMessage("");

      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pincode,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "Unable to create order.");
      }

      const razorpay = new window.Razorpay({
        key: result.keyId,
        amount: result.razorpayOrder.amount,
        currency: result.razorpayOrder.currency,
        name: "Tirupati Medix",
        description: `Order ${result.orderSummary.billNo}`,
        image: "/main-logo.webp",
        order_id: result.razorpayOrder.id,
        prefill: {
          name: result.customer?.name,
          email: result.customer?.email,
          contact: result.customer?.phone,
        },
        theme: {
          color: "#166249",
        },
        handler: async function (paymentResponse: Record<string, string>) {
          const verifyResponse = await fetch("/api/checkout/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            }),
          });

          const verifyResult = await verifyResponse.json();
          if (!verifyResponse.ok || !verifyResult.ok) {
            setStatusMessage(verifyResult.message ?? "Payment verification failed.");
            return;
          }

          setStatusMessage(`Payment successful. Order confirmed with Bill No: ${verifyResult.billNo}`);
          window.location.href = "/cart";
        },
      });

      razorpay.open();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to place order.");
    } finally {
      setLoadingOrder(false);
    }
  }

  useEffect(() => {
    void fetchMe();
  }, []);

  useEffect(() => {
    void verifyShipping(pincode);
  }, [pincode]);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="content-page container split-grid">
        <section className="info-card">
          <h1>Checkout</h1>
          <p className="muted">
            Secure payment with Razorpay. GST (5%) and shipping are calculated instantly by pincode.
          </p>

          {loadingMe ? <p className="muted">Checking login status...</p> : null}

          {!loadingMe && !authenticatedEmail ? (
            <AuthEmailOtp
              compact
              onVerified={(email) => {
                setAuthenticatedEmail(email);
                setStatusMessage("Email verified. Continue checkout.");
              }}
            />
          ) : null}

          {authenticatedEmail ? (
            <p className="muted">Logged in as: {authenticatedEmail}</p>
          ) : null}

          <form className="list-reset" action="#" onSubmit={(event) => event.preventDefault()}>
            <label>
              Full Name
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={form.customerName}
                onChange={(event) => setForm((prev) => ({ ...prev, customerName: event.target.value }))}
              />
            </label>
            <label>
              Mobile Number
              <input
                type="tel"
                name="phone"
                placeholder="10-digit mobile number"
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    phone: event.target.value.replace(/[^0-9]/g, "").slice(0, 10),
                  }))
                }
              />
            </label>
            <label>
              Delivery Address
              <textarea
                name="address"
                rows={4}
                placeholder="House no, lane, area"
                value={form.addressLine}
                onChange={(event) => setForm((prev) => ({ ...prev, addressLine: event.target.value }))}
              />
            </label>
            <label>
              City
              <input
                type="text"
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
              />
            </label>
            <label>
              State
              <input
                type="text"
                value={form.state}
                onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
              />
            </label>
            <label>
              Pincode
              <input
                type="text"
                value={pincode}
                onChange={(event) => setPincode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="Enter 6-digit pincode"
              />
            </label>
            <label>
              Order Notes (optional)
              <textarea
                rows={2}
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Any delivery note"
              />
            </label>
            <button type="button" className="btn btn-primary" onClick={handlePayNow} disabled={loadingOrder || !canPay}>
              {loadingOrder ? "Creating order..." : "Pay Now"}
            </button>
          </form>
        </section>

        <aside className="info-card">
          <h3>Order Summary</h3>
          <ul className="list-reset">
            <li>
              <span>Subtotal</span>
              <strong>Rs. {cartSummary?.subtotal.toFixed(2) ?? "0.00"}</strong>
            </li>
            <li>
              <span>GST (5%)</span>
              <strong>Rs. {cartSummary?.pricing.gstAmount.toFixed(2) ?? "0.00"}</strong>
            </li>
            <li>
              <span>Shipping</span>
              <strong>
                {cartSummary?.pricing.shippingAmount
                  ? `Rs. ${cartSummary.pricing.shippingAmount.toFixed(2)}`
                  : "Free"}
              </strong>
            </li>
            <li>
              <span>Total</span>
              <strong>Rs. {cartSummary?.pricing.total.toFixed(2) ?? "0.00"}</strong>
            </li>
          </ul>
          <p className="muted">
            Free shipping above Rs. 2000, and above Rs. 1000 for Udaipur pincodes 313001-313005.
          </p>
          {statusMessage ? <p className="muted">{statusMessage}</p> : null}
        </aside>
      </div>
    </>
  );
}
