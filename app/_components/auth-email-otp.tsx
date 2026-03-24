"use client";

import { useState } from "react";

type AuthEmailOtpProps = {
  onVerified?: (email: string) => void;
  compact?: boolean;
};

export function AuthEmailOtp({ onVerified, compact = false }: AuthEmailOtpProps) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 25000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  async function requestOtp() {
    try {
      setLoading(true);
      setMessage("");
      const response = await fetchWithTimeout("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "Unable to send OTP.");
      }
      setStep("otp");
      setMessage("OTP sent to your email.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessage("OTP request timed out. Please check SMTP settings and try again.");
      } else {
        setMessage(error instanceof Error ? error.message : "Unable to send OTP.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    try {
      setLoading(true);
      setMessage("");
      const response = await fetchWithTimeout("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message ?? "Unable to verify OTP.");
      }
      setMessage("Email verified successfully.");
      onVerified?.(result.user?.email ?? email);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessage("OTP verification timed out. Please try again.");
      } else {
        setMessage(error instanceof Error ? error.message : "Unable to verify OTP.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h3>{compact ? "Login" : "Email Login"}</h3>
      <p className="muted">Verify via OTP before placing order.</p>
      <div className="list-reset">
        <label>
          Email Address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            disabled={step === "otp"}
          />
        </label>
        {step === "otp" ? (
          <label>
            OTP
            <input
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="6-digit OTP"
              maxLength={6}
            />
          </label>
        ) : null}
      </div>
      <div className="hero__cta">
        {step === "email" ? (
          <button type="button" className="btn btn-primary" onClick={requestOtp} disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-primary" onClick={verifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setStep("email");
                setOtp("");
                setMessage("");
              }}
            >
              Change Email
            </button>
          </>
        )}
      </div>
      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
