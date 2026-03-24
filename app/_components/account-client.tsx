"use client";

import { useEffect, useState } from "react";

import { AuthEmailOtp } from "@/app/_components/auth-email-otp";

type MeResult = {
  authenticated: boolean;
  user?: { email: string };
};

export function AccountClient() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function refresh() {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/me");
      const result = (await response.json()) as MeResult;
      if (result.authenticated && result.user?.email) {
        setEmail(result.user.email);
      } else {
        setEmail(null);
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
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="content-page container split-grid">
      <section className="info-card">
        <h1>Profile</h1>
        <p className="muted">Login using email OTP to manage checkout quickly.</p>

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
          </>
        ) : null}

        {!loading && !email ? (
          <AuthEmailOtp
            onVerified={(verifiedEmail) => {
              setEmail(verifiedEmail);
              setMessage("Login successful.");
            }}
          />
        ) : null}

        {message ? <p className="muted">{message}</p> : null}
      </section>
    </div>
  );
}
