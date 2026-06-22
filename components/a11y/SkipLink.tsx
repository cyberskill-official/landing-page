// Server component. First focusable element on the page (WCAG 2.4.1).
export function SkipLink({ label }: { label: string }) {
  return (
    <a href="#main" className="cs-skip-link">
      {label}
    </a>
  );
}
