export type JsonLdComponentType = {
  readonly data:
    | Record<string, unknown>
    | ReadonlyArray<Record<string, unknown>>;
};

/**
 * Renders a JSON-LD script tag. Accepts a single object or an array of objects.
 */
export function JsonLdComponent(props: JsonLdComponentType) {
  const payload = Array.isArray(props.data) ? props.data : [props.data];
  // '<'를 이스케이프해서 script 태그를 조기 종료하는 값이 들어가지 않도록 함
  const json = (
    payload.length === 1 ? JSON.stringify(payload[0]) : JSON.stringify(payload)
  ).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: 직렬화 후 '<'를 이스케이프한 정적 JSON-LD만 주입
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
