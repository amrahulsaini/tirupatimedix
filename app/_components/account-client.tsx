"use client";

import { useEffect, useState } from "react";

import { AuthEmailOtp } from "@/app/_components/auth-email-otp";

type MeResult = {
  authenticated: boolean;
  user?: { email: string };
};

type OrderItem = {
  productName: string;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
};

type OrderRecord = {
  id: number;
  billNo: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  shippingAmount: number;
  gstAmount: number;
  createdAt: string;
  items: OrderItem[];
};

export function AccountClient() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  async function loadOrders() {
    try {
      setLoadingOrders(true);
      const response = await fetch("/api/orders/history");
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setOrders([]);
        return;
      }
      setOrders(result.orders ?? []);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function refresh() {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/me");
      const result = (await response.json()) as MeResult;
      if (result.authenticated && result.user?.email) {
        setEmail(result.user.email);
        await loadOrders();
      } else {
        setEmail(null);
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      setMessage(result.message ?? "Logout failed.");
      return;
    }
    setMessage("Logged out successfully.");
    setEmail(null);
    setOrders([]);
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="content-page container split-grid">
      <section className="info-card">
        <h1>Profile</h1>
        <p className="muted">Manage your account and review your previous orders.</p>

        {loading ? <p className="muted">Checking profile...</p> : null}

        {!loading && email ? (
          <>
            <p>
              Signed in as <strong>{email}</strong>
            </p>
            <div className="hero__cta">
              <button type="button" className="btn btn-secondary" onClick={logout}>
                Logout
              </button>
            </div>

            <div className="order-history-card">
              <h3>Order History</h3>
              {loadingOrders ? <p className="muted">Loading orders...</p> : null}
              {!loadingOrders && orders.length === 0 ? (
                <p className="muted">No orders found yet.</p>
              ) : null}

              {orders.map((order) => (
                <article key={order.id} className="order-history-item">
                  <div className="order-history-item__head">
                    <div>
                      <strong>{order.billNo}</strong>
                      <p className="muted">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <span className={`order-chip order-chip--${order.paymentStatus}`}>{order.paymentStatus}</span>
                    </div>
                  </div>

                  <ul className="list-reset">
                    {order.items.slice(0, 3).map((item, index) => (
                      <li key={`${order.id}-${index}`}>
                        <span className="order-history-item__product">
                          {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : null}
                          <span>
                            {item.productName} x {item.quantity}
                          </span>
                        </span>
                        <strong>Rs. {item.lineTotal.toFixed(2)}</strong>
                      </li>
                    ))}
                  </ul>

                  <div className="order-history-item__foot">
                    <span>GST: Rs. {order.gstAmount.toFixed(2)}</span>
                    <span>Shipping: Rs. {order.shippingAmount.toFixed(2)}</span>
                    <strong>Total: Rs. {order.totalAmount.toFixed(2)}</strong>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {!loading && !email ? (
          <AuthEmailOtp
            onVerified={(verifiedEmail) => {
              setEmail(verifiedEmail);
              setMessage("Login successful.");
              void loadOrders();
            }}
          />
        ) : null}

        {message ? <p className="muted">{message}</p> : null}
      </section>
    </div>
  );
}
