import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { bcp47, defaultLocale, isLocale } from "@/lib/i18n/config";
import { company, siteUrl } from "@/lib/content/site";
import { CosmosBackdrop } from "@/components/CosmosBackdrop";
import { CosmosCanvas } from "@/components/CosmosCanvas";

// Display face (FR-DS-008): Space Grotesk with the REAL Vietnamese subset.
// The old system-serif stack (Iowan Old Style/Palatino) lacks Vietnamese
// diacritics, so VN headings fell back per-glyph and rendered as a mix of
// typefaces. next/font self-hosts the files at build time (keyless, no
// runtime request to Google) and generates a size-adjusted fallback so the
// swap does not shift layout.
const displayFont = Space_Grotesk({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-display",
});

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

  return (
    // Dark is the default theme (operator decision 2026-07-02): the gold-on-
    // umber art direction is the brand-defining look. A stored "light"
    // preference still wins via the no-flash script below.
    <html lang={bcp47[locale]} data-theme="dark" className={displayFont.variable} suppressHydrationWarning>
      <Script
        id="gtm"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-TD6N8D98');
          `,
        }}
      />
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TD6N8D98"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <script
          // No-flash: apply the saved theme before paint, and arm the
          // once-per-session intro veil (FR-DS-012) - skipped entirely under
          // prefers-reduced-motion, and without JS the attribute is never set,
          // so the veil stays display:none for crawlers and no-JS visitors.
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('cs-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();" +
              "(function(){try{if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;var s=window.sessionStorage;if(s&&!s.getItem('cs-intro')){s.setItem('cs-intro','1');document.documentElement.setAttribute('data-intro','play');}}catch(e){}})();",
          }}
        />
        {/* Permanent cosmos behind the content (z-index 0 < 1), revealed on
            digest. The CSS backdrop is the universal fallback; the 3D canvas
            rides just above it on capable devices for true depth. */}
        <CosmosBackdrop />
        <CosmosCanvas />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
