import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { bcp47, defaultLocale, isLocale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? company.url),
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
    <html lang={bcp47[locale]} data-theme="light" suppressHydrationWarning>
      <body>
        <script
          // No-flash: apply the saved theme before paint.
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('cs-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();",
          }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
