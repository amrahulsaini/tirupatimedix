import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Tirupati Medix ecommerce platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="content-page container">
      <article className="info-card">
        <h1>Privacy Policy</h1>
        <p className="muted">
          Tirupati Medix respects your privacy. We collect only necessary data to process orders,
          verify prescriptions, provide support, and improve service quality.
        </p>
        <ul>
          <li>Personal data is used only for order fulfillment and customer communication.</li>
          <li>Prescription uploads are handled securely and shared only for medical validation.</li>
          <li>Payment data is processed through trusted payment partners.</li>
          <li>You can request profile data updates or deletion by contacting support.</li>
        </ul>
      </article>
    </div>
  );
}
