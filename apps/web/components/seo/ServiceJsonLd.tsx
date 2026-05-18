import { JsonLd } from './JsonLd';
import { CAPABILITIES, buildItemListJsonLd, buildServiceJsonLd } from '@/lib/seo/capabilities-schema';

type ServiceJsonLdProps = {
  embedMode?: 'individual' | 'list';
};

export function ServiceJsonLd({ embedMode = 'list' }: ServiceJsonLdProps) {
  if (embedMode === 'individual') {
    return (
      <>
        {CAPABILITIES.map((capability) => (
          <JsonLd key={capability.id} schema={buildServiceJsonLd(capability)} />
        ))}
      </>
    );
  }

  return <JsonLd schema={buildItemListJsonLd()} />;
}
