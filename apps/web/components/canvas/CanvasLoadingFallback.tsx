export function CanvasLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      data-canvas-loading
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: 'rgba(222, 175, 89, 0.12)',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
        }}
      >
        Loading 3D scene
      </span>
    </div>
  );
}
