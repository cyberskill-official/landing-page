// Route-level loading fallback (FR-WEB-007). Language-neutral skeleton so it
// works for both locales without params. Announced politely to assistive tech.
export default function Loading() {
  return (
    <section className="cs-section" aria-busy="true" aria-live="polite">
      <div className="cs-container">
        <span className="cs-visually-hidden">Loading</span>
        <div className="cs-skeleton-grid" aria-hidden="true">
          <div className="cs-skeleton cs-skeleton-title" />
          <div className="cs-skeleton cs-skeleton-line" />
          <div className="cs-skeleton cs-skeleton-line" style={{ width: "70%" }} />
        </div>
      </div>
    </section>
  );
}
