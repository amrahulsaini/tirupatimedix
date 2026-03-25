"use client";

import Link from "next/link";
import Script from "next/script";
import { CheckCircle2, Gift } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AuthEmailOtp } from "@/app/_components/auth-email-otp";

type MeResponse = {
  authenticated: boolean;
  user?: { email: string };
};

type CartSummary = {
  items: Array<{
    id: number;
    imageUrl: string | null;
    productName: string;
    productSubtitle: string;
    quantity: number;
    lineTotal: number;
  }>;
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
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams.get("status") ?? "";
  const billNoFromQuery = searchParams.get("billNo") ?? "";

  const [authenticatedEmail, setAuthenticatedEmail] = useState<string | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"info" | "success" | "error">("info");
  const [pincode, setPincode] = useState("");
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [showFreeShippingPopup, setShowFreeShippingPopup] = useState(false);
  const [freeShippingPopupShownForPincode, setFreeShippingPopupShownForPincode] = useState<string | null>(null);
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

  async function loadCartSummary(nextPincode: string) {
    const query = nextPincode ? `?pincode=${encodeURIComponent(nextPincode)}` : "";
    const response = await fetch(`/api/cart${query}`);

    const result = await response.json();
    if (!response.ok || !result.ok) {
      setStatusType("error");
      setStatusMessage(result.message ?? "Unable to load order summary.");
      return;
    }

    setCartSummary({
      items: Array.isArray(result.cart?.items) ? result.cart.items : [],
      subtotal: Number(result.cart?.subtotal ?? 0),
      pricing: result.pricing,
      shippingMessage: result.shippingNote,
    });

    if (nextPincode.length === 6) {
      setStatusType("info");
      setStatusMessage(result.shippingNote);
    }
  }

  async function handlePayNow() {
    if (!canPay) {
      setStatusType("error");
      setStatusMessage("Please complete email verification and all checkout details.");
      return;
    }

    if (!window.Razorpay) {
      setStatusType("error");
      setStatusMessage("Razorpay script did not load. Please refresh the page.");
      return;
    }

    try {
      setLoadingOrder(true);
      setStatusMessage("");
      setStatusType("info");

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
            setStatusType("error");
            setStatusMessage(verifyResult.message ?? "Payment verification failed.");
            return;
          }

          setStatusType("success");
          setStatusMessage(`Payment successful. Order confirmed with Bill No: ${verifyResult.billNo}`);
          window.location.href = `/checkout?status=success&billNo=${encodeURIComponent(verifyResult.billNo)}`;
        },
        modal: {
          ondismiss: function () {
            setStatusType("error");
            setStatusMessage("Payment was cancelled. You can retry anytime.");
          },
        },
      });

      // Razorpay exposes failed attempts via this event in browser runtime.
      (razorpay as { on?: (event: string, cb: (resp: { error?: { description?: string } }) => void) => void }).on?.(
        "payment.failed",
        (resp) => {
          setStatusType("error");
          setStatusMessage(resp?.error?.description ?? "Payment failed. Please try again.");
        }
      );

      razorpay.open();
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error instanceof Error ? error.message : "Unable to place order.");
    } finally {
      setLoadingOrder(false);
    }
  }

  useEffect(() => {
    void fetchMe();
  }, []);

  useEffect(() => {
    void loadCartSummary(pincode);
  }, [pincode]);

  useEffect(() => {
    const isEligible =
      pincode.length === 6 &&
      !!cartSummary?.pricing.isUdaipurPincode &&
      Number(cartSummary?.subtotal ?? 0) >= 1000 &&
      Number(cartSummary?.pricing.shippingAmount ?? 0) === 0;

    if (isEligible && freeShippingPopupShownForPincode !== pincode) {
      setShowFreeShippingPopup(true);
      setFreeShippingPopupShownForPincode(pincode);
    }
  }, [cartSummary, freeShippingPopupShownForPincode, pincode]);

  if (checkoutStatus === "success") {
    return (
      <div className="content-page container">
        <section className="info-card checkout-success-card">
          <h1>
            <CheckCircle2 size={28} />
            Payment Successful
          </h1>
          <p className="muted">Your order has been confirmed and receipt has been sent on email.</p>
          <div className="checkout-success-card__bill">Bill No: {billNoFromQuery || "N/A"}</div>
          <div className="hero__cta">
            <Link className="btn btn-primary" href="/account">
              View Order History
            </Link>
            <Link className="btn btn-secondary" href="/shop">
              Continue Shopping
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {showFreeShippingPopup ? (
        <div className="checkout-dialog-backdrop" role="presentation">
          <div className="checkout-dialog" role="dialog" aria-modal="true" aria-label="Free shipping unlocked">
            <h3>
              <Gift size={18} /> Free Shipping Unlocked
            </h3>
            <p>
              Your pincode is eligible for Udaipur special delivery and cart total is above Rs. 1000.
            </p>
            <p className="muted">
              Shipping charge is now <strong>Free</strong>.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => setShowFreeShippingPopup(false)}>
              Great
            </button>
          </div>
        </div>
      ) : null}
      <div className="content-page container split-grid">
        <section className="info-card">
          <h1>Checkout</h1>
          <p className="muted">Complete your address and proceed to secure payment.</p>

          {loadingMe ? <p className="muted">Checking login status...</p> : null}

          {!loadingMe && !authenticatedEmail ? (
            <AuthEmailOtp
              compact
              onVerified={(email) => {
                setAuthenticatedEmail(email);
                setStatusType("success");
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

        <aside className="info-card order-summary-card">
          <h3>Order Summary</h3>
          {cartSummary?.items.length ? (
            <div className="checkout-summary-items">
              {cartSummary.items.map((item) => (
                <article key={item.id} className="checkout-summary-item">
                  <div className="checkout-summary-item__media">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="checkout-summary-item__image" />
                    ) : (
                      <div className="checkout-summary-item__image checkout-summary-item__image--placeholder">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="checkout-summary-item__content">
                    <h4>{item.productName}</h4>
                    <p className="muted">{item.productSubtitle}</p>
                    <div className="checkout-summary-item__meta">
                      <span>Qty: {item.quantity}</span>
                      <strong>Rs. {item.lineTotal.toFixed(2)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          <ul className="list-reset order-summary-list">
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
            <li className="order-summary-list__total">
              <span>Total</span>
              <strong>Rs. {cartSummary?.pricing.total.toFixed(2) ?? "0.00"}</strong>
            </li>
          </ul>
          {statusMessage ? <p className={`checkout-notice checkout-notice--${statusType}`}>{statusMessage}</p> : null}
        </aside>
      </div>
    </>
  );
}
