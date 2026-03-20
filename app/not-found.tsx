import Link from "next/link";

export default function NotFound() {
  return (
    <div className="content-page container">
      <article className="info-card">
        <h1>Page Not Found</h1>
        <p className="muted">The page you are looking for does not exist or has been moved.</p>
        <Link href="/" className="btn btn-primary">
          Return to Home
        </Link>
      </article>
    </div>
  );
}
