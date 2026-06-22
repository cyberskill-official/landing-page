"use client";

// Root error boundary. Keeps the page recoverable instead of a blank crash.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="cs-section">
      <div className="cs-container" style={{ maxWidth: "40rem", textAlign: "center" }}>
        <h1>Something went wrong</h1>
        <p className="cs-section-lead">
          An unexpected error occurred. You can try again, or email info@cyberskill.world.
        </p>
        <div className="cs-hero-actions" style={{ justifyContent: "center" }}>
          <button type="button" className="cs-btn cs-btn-primary" onClick={() => reset()}>
            Try again
          </button>
        </div>
      </div>
    </main>
  );
}
