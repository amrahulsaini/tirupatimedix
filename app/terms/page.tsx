import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for ordering on Tirupati Medix.",
};

export default function TermsPage() {
  return (
    <div className="content-page container">
      <article className="info-card">
        <h1>Terms & Conditions</h1>
        <ul>
          <li>All medicine sales are subject to prescription compliance and legal regulations.</li>
          <li>Prices, availability, and offers may change without prior notice.</li>
          <li>Orders can be canceled before dispatch. Refund policy applies as per item category.</li>
          <li>
            Tirupati Medix reserves the right to hold or reject orders lacking required information.
          </li>
          <li>
            Customers are responsible for providing accurate contact and delivery details.
          </li>
        </ul>
      </article>
    </div>
  );
}
