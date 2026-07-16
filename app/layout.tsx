import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { company, siteUrl } from "@/lib/content/site";
import { CosmosBackdrop } from "@/components/CosmosBackdrop";
import { CosmosCanvas } from "@/components/CosmosCanvas";
import { DeferredCursorTrail } from "@/components/motion/DeferredCursorTrail";
import { DeferredFonts } from "@/components/DeferredFonts";
import { DeferredPoster } from "@/components/DeferredPoster";
import { AnalyticsScripts } from "@/components/seo/AnalyticsScripts";
import { MotionPreferenceSync } from "@/components/a11y/MotionPreferenceSync";
import { CRITICAL_CSS, CRITICAL_STYLE_ID } from "@/lib/critical-css";

// Vercel Analytics / Speed Insights inject /_vercel/*/script.js. Those routes
// only exist on the Vercel edge — local `next start` 404s them, and Lighthouse
// Best Practices fails on the console errors. Ship them only when hosted.
const onVercel = process.env.VERCEL === "1";

// Theme + motion boot script (hash-pinned in CSP via proxy.ts). No headers()
// here so [lang] routes can be fully static — calling headers() forced dynamic
// streaming and inflated mobile lab LCP ~2s past FCP under Lantern.
const BOOT_SCRIPT =
  "(function(){try{var t=localStorage.getItem('cs-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();" +
  "(function(){try{var m=localStorage.getItem('cs-motion-reduce');var r=m==='true'||(m!=='false'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);if(r){document.documentElement.setAttribute('data-motion','reduce');}}catch(e){}})();";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CyberSkill - Turn Your Will Into Real",
    template: "%s - CyberSkill",
  },
  description:
    "CyberSkill is a software solutions consultancy in Ho Chi Minh City. We build web apps, mobile apps, and internal systems that ship and stay maintainable.",
  applicationName: "CyberSkill",
  authors: [{ name: company.shortName, url: company.url }],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: "CyberSkill",
    title: "CyberSkill - Turn Your Will Into Real",
    description:
      "Software solutions consultancy. Web, mobile, and internal systems, built honestly.",
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#45210E" },
    { media: "(prefers-color-scheme: light)", color: "#FDF4E1" },
  ],
};

// Static root shell. Locale-specific <html lang> is refined by HtmlLang in the
// [lang] layout after mount; default en is correct for the prerendered /en shell.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* First-paint CSS inside the prerender snapshot (Vercel freezes HTML
            during next build; post-build Critters never reaches production). */}
        <style
          id={CRITICAL_STYLE_ID}
          dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }}
        />
      </head>
      <AnalyticsScripts />
      <body>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }}
        />
        <MotionPreferenceSync />
        <DeferredFonts />
        <DeferredPoster />
        <CosmosBackdrop />
        <CosmosCanvas />
        <DeferredCursorTrail />
        {children}
        {onVercel ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
