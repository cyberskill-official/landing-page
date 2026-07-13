export default function Loading() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "var(--color-bg, #45210E)",
      color: "var(--color-fg, #FDF4E1)"
    }}>
      <div 
        className="cs-lumi-orb"
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #f4ba17 0%, transparent 70%)",
          animation: "cs-loading-pulse 1.5s infinite ease-in-out",
          opacity: 0.8,
          marginBottom: "16px"
        }}
      />
      <p style={{ fontFamily: "var(--font-display)", opacity: 0.7 }}>
        Summoning...
      </p>
    </div>
  );
}
