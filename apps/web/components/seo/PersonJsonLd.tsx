import { JsonLd } from './JsonLd';
import { FOUNDER, buildPersonJsonLd } from '@/lib/seo/founder-schema';

export function FounderPersonJsonLd() {
  return <JsonLd schema={buildPersonJsonLd(FOUNDER)} />;
}
