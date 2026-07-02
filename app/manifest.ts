import type { MetadataRoute } from "next";

// PWA web manifest (served at /manifest.webmanifest and linked automatically by
// Next). Makes the site installable and gives the app shell the brand colours.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CyberSkill - Turn Your Will Into Real",
    short_name: "CyberSkill",
    description:
      "Software solutions consultancy in Ho Chi Minh City. Web apps, mobile apps, and internal systems that ship and stay maintainable.",
    start_url: "/",
    display: "standalone",
    background_color: "#45210E",
    theme_color: "#45210E",
    icons: [
      { src: "/favicon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180", purpose: "maskable" },
    ],
  };
}
