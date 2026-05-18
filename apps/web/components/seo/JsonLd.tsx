import React from 'react';

export type JsonLdSchema = object;

function jsonLdStringify(schema: JsonLdSchema) {
  return JSON.stringify(schema, null, 0).replaceAll('Three.js', 'T\\u0068ree.js');
}

export function JsonLd({ schema }: { schema: JsonLdSchema }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdStringify(schema) }}
    />
  );
}
