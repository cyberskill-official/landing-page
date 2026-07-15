// Brand-gold aurora backdrop (TASK-DS-012): three pre-blurred radial-gradient
// blobs drifting on transform only. No filter/blur at paint time, so it is
// cheap on every GPU; static (but still present) under reduced motion; clipped
// by the host section. Decorative: aria-hidden, behind the section's content.
export function Aurora({ className }: { className?: string }) {
  return (
    <div className={["cs-aurora", className].filter(Boolean).join(" ")} aria-hidden="true">
      <span className="cs-aurora-blob cs-aurora-b1" />
      <span className="cs-aurora-blob cs-aurora-b2" />
      <span className="cs-aurora-blob cs-aurora-b3" />
    </div>
  );
}
