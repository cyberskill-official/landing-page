import type { ProfessionalServiceSchema } from './professional-service';

export function JsonLd({ schema }: { schema: ProfessionalServiceSchema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  );
}
