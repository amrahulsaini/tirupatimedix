import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about orders and medicines.",
};

const faqs = [
  {
    question: "Do I need a prescription for all medicines?",
    answer:
      "Prescription medicines require a valid doctor prescription. OTC products can be purchased directly.",
  },
  {
    question: "How quickly are orders delivered?",
    answer:
      "Most local orders are processed the same day. Delivery timelines can vary by location and stock.",
  },
  {
    question: "Can I return medicines?",
    answer:
      "Medicines are generally non-returnable for safety reasons, except in cases of damage or wrong item delivery.",
  },
  {
    question: "How do I place recurring monthly orders?",
    answer:
      "You can contact support to set up repeat medicine reminders and priority restocking.",
  },
];

export default function FaqPage() {
  return (
    <div className="content-page container">
      <div className="content-hero">
        <h1>Frequently Asked Questions</h1>
        <p>Quick answers to common queries about medicines, prescriptions, and deliveries.</p>
      </div>

      <section className="section product-grid">
        {faqs.map((faq) => (
          <article key={faq.question} className="info-card">
            <h3>{faq.question}</h3>
            <p className="muted">{faq.answer}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
