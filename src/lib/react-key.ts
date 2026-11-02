// 내용이 같은 항목이 있어도 중복되지 않는 React key를 만든다 (index 대신 등장 횟수를 사용)
export function withUniqueKeys<T>(
  items: readonly T[],
  toKey: (item: T) => string
): Array<{ key: string; item: T; position: number }> {
  const seen = new Map<string, number>();
  return items.map((item, position) => {
    const base = toKey(item);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return { key: count === 0 ? base : `${base}#${count}`, item, position };
  });
}
