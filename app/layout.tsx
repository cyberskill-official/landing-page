import "./globals.css";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { bcp47, defaultLocale, isLocale } from "@/lib/i18n/config";
import { company, siteUrl } from "@/lib/content/site";
import { CosmosBackdrop } from "@/components/CosmosBackdrop";
import { CosmosCanvas } from "@/components/CosmosCanvas";
import { CursorTrail } from "@/components/motion/CursorTrail";
import { displayFont } from "@/app/fonts";
import { AnalyticsScripts } from "@/components/seo/AnalyticsScripts";
import { MotionPreferenceSync } from "@/components/a11y/MotionPreferenceSync";

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
  // Let search and AI engines show the full social card and snippet, so the
  // brand's first impression in results is the large gold Lumi image, not a
  // clipped thumbnail.
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

// Brand the mobile browser chrome (address bar / status bar) to the gold-on-
// umber art direction, matched to the user's color scheme. The site defaults to
// the dark (umber) look; light-scheme users get the cream shell.
export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#45210E" },
    { media: "(prefers-color-scheme: light)", color: "#FDF4E1" },
  ],
};

// The root layout owns <html>/<body>. The locale is provided by middleware via
// the x-cs-locale request header so <html lang> matches the rendered content.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const headerLocale = h.get("x-cs-locale") ?? defaultLocale;
  const locale = isLocale(headerLocale) ? headerLocale : defaultLocale;
  const nonce = h.get("x-nonce") ?? undefined;

  return (
    // Dark is the default theme (operator decision 2026-07-02): the gold-on-
    // umber art direction is the brand-defining look. A stored "light"
    // preference still wins via the no-flash script below.
    <html lang={bcp47[locale]} data-theme="dark" className={displayFont.variable} suppressHydrationWarning>
      <AnalyticsScripts nonce={nonce} />
      <body>
        <script
          // No-flash: apply the saved theme before paint, and arm the
          // once-per-session intro veil (FR-DS-012) - skipped entirely under
          // prefers-reduced-motion, and without JS the attribute is never set,
          // so the veil stays display:none for crawlers and no-JS visitors.
          //
          // suppressHydrationWarning: browsers intentionally clear the `nonce`
          // *content attribute* right after parsing a script tag (it stays
          // readable only via the `.nonce` IDL property) so inline CSP nonces
          // can't be read back out of the DOM. React's hydration diff reads the
          // attribute, so it always sees "" on the live DOM even though it
          // rendered the real nonce - a benign, well-known false positive
          // (https://github.com/facebook/react/issues/29577), not an actual
          // markup mismatch. suppressHydrationWarning silences just that.
          suppressHydrationWarning
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('cs-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();" +
              "(function(){try{var m=localStorage.getItem('cs-motion-reduce');var r=m==='true'||(m!=='false'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);if(r){document.documentElement.setAttribute('data-motion','reduce');return;}var s=window.sessionStorage;if(s&&!s.getItem('cs-intro')){s.setItem('cs-intro','1');document.documentElement.setAttribute('data-intro','play');}}catch(e){}})();",
          }}
        />
        {/* Permanent cosmos behind the content (z-index 0 < 1), revealed on
            digest. The CSS backdrop is the universal fallback; the 3D canvas
            rides just above it on capable devices for true depth. */}
        {/* Resolves the real prefers-reduced-motion / cs-motion-reduce state
            into useMotionStore exactly once, strictly after hydration - see
            lib/a11y/motion-store.ts for why this can't happen at module scope
            (that was the source of the DepthField/StoryArc hydration-mismatch
            errors and the intermittent "Lumi frozen" reports). */}
        <MotionPreferenceSync />
        <CosmosBackdrop />
        <CosmosCanvas />
        <CursorTrail />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
