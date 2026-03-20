import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-shell">
        <LoaderCircle className="loading-spinner" size={44} />
        <h2>Loading Tirupati Medix</h2>
        <p>Preparing medicines and wellness content for you...</p>
      </div>
    </div>
  );
}
