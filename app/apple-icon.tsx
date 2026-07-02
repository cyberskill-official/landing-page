import { ImageResponse } from "next/og";

// iOS home-screen / high-res touch icon (PNG). SVG favicons are unreliable as
// Apple touch icons, so this renders the gold Lumi orb on umber at 180px.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#45210E",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "radial-gradient(circle at 42% 36%, #FCE9A8, #F4BA17 52%, #B5780A 100%)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
