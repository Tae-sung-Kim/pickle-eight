import React from 'react';

export type JsonLdProps = {
  readonly data:
    | Record<string, unknown>
    | ReadonlyArray<Record<string, unknown>>;
};

/**
 * Renders a JSON-LD script tag. Accepts a single object or an array of objects.
 */
export function JsonLd(props: JsonLdProps) {
  const payload = Array.isArray(props.data) ? props.data : [props.data];
  const json =
    payload.length === 1 ? JSON.stringify(payload[0]) : JSON.stringify(payload);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export default JsonLd;
