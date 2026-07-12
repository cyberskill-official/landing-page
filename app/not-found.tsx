import Link from "next/link";

// Global 404 (rendered inside the root layout). Bilingual, since an unmatched
// path has no locale segment.
export default function NotFound() {
  return (
    <main id="main" className="cs-section">
      <div className="cs-container" style={{ maxWidth: "40rem", textAlign: "center" }}>
        <div className="cs-lumi-orb" aria-hidden="true" style={{ width: "80px", height: "80px", margin: "0 auto 24px", background: "radial-gradient(circle, #f4ba17 0%, transparent 70%)", borderRadius: "50%", opacity: 0.8 }} />
        <p className="cs-eyebrow">404 - Wish not found</p>
        <h1 style={{ marginBottom: "1rem" }}>The lamp is empty</h1>
        <p className="cs-section-lead">
          <span lang="vi">Lumi không thể tìm thấy trang này.</span> / Lumi couldn't find this page in the lamp.
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
