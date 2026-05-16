import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { PROFESSIONAL_SERVICE } from '@/components/seo/professional-service';
import { SmoothScrollProvider } from '@/components/scroll/SmoothScrollProvider';
import { GlobalCanvasShell } from '@/components/canvas/GlobalCanvasShell';

export const metadata: Metadata = {
  title: 'CyberSkill — Turn Your Will Into Real | Senior Software from Vietnam',
  description: 'Senior-only Vietnamese software solutions consultancy. We turn your will into real software.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <JsonLd schema={PROFESSIONAL_SERVICE} />
      </head>
      <body>
        <SmoothScrollProvider>
          {children}
          <GlobalCanvasShell />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
