"use client";

import { FormEvent, useState } from "react";

type NoticeState = {
  type: "success" | "error";
  message: string;
} | null;

export function ContactForm() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<NoticeState>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !mobile.trim() || !message.trim()) {
      setNotice({ type: "error", message: "Please fill name, mobile number, and message." });
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          message: message.trim(),
        }),
      });

      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Unable to send message right now.");
      }

      setNotice({ type: "success", message: "Message sent successfully. Our team will contact you soon." });
      setName("");
      setMobile("");
      setMessage("");
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to send message right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="list-reset" onSubmit={handleSubmit}>
      <label>
        Name
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>
      <label>
        Mobile Number
        <input
          type="tel"
          placeholder="+91"
          value={mobile}
          onChange={(event) => setMobile(event.target.value)}
          required
        />
      </label>
      <label>
        Message
        <textarea
          rows={4}
          placeholder="Write your query"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
      </label>
      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
      {notice ? (
        <p className={`checkout-notice ${notice.type === "success" ? "checkout-notice--success" : "checkout-notice--error"}`}>
          {notice.message}
        </p>
      ) : null}
    </form>
  );
}
