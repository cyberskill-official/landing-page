import Link from "next/link";

// Global 404 (rendered inside the root layout). Bilingual, since an unmatched
// path has no locale segment.
export default function NotFound() {
  return (
    <main id="main" className="cs-section">
      <div className="cs-container" style={{ maxWidth: "40rem", textAlign: "center" }}>
        <div className="cs-lumi-orb" aria-hidden="true" />
        <p className="cs-eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="cs-section-lead">
          <span lang="vi">Không tìm thấy trang.</span> / This page does not exist.
        </p>
        <div className="cs-hero-actions" style={{ justifyContent: "center" }}>
          <Link className="cs-btn cs-btn-primary" href="/en">
            English home
          </Link>
          <Link className="cs-btn cs-btn-secondary" href="/vi" hrefLang="vi" lang="vi">
            Trang tiếng Việt
          </Link>
        </div>
      </div>
    </main>
  );
}
