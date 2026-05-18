export default function WorkLoading() {
  return (
    <main className="route-loading" aria-live="polite" aria-busy="true">
      <span className="route-loading__pulse" aria-hidden="true" />
      <span>Loading case study...</span>
    </main>
  );
}
