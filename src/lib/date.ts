export function getKoreaTime(date = new Date()): Date {
  const utc = date.getTime();
  const localOffset = date.getTimezoneOffset() * 60 * 1000;
  const kstOffset = 9 * 60 * 60 * 1000;
  return new Date(utc + localOffset + kstOffset);
}
