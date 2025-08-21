export function getKoreaTime(date = new Date()): Date {
  const utc = date.getTime();
  const localOffset = date.getTimezoneOffset() * 60 * 1000;
  const kstOffset = 9 * 60 * 60 * 1000;
  return new Date(utc + localOffset + kstOffset);
}

// 날짜 return
export const getTodayString = () => {
  const today = getKoreaTime();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// 24시간제 리턴
export function getKoreanTimeString24(date: Date): string {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const isAM = hour < 12;
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const period = isAM ? '오전' : '오후';
  if (minute === 0) {
    return `${period} ${displayHour}시`;
  }
  return `${period} ${displayHour}시 ${minute}분`;
}

export function getKoreanTimeString(date: Date): string {
  const hour = date.getHours();
  const minute = date.getMinutes();
  if (minute === 0) {
    return `${hour}시`;
  }
  return `${hour}시 ${minute}분`;
}

/**
 * Build Open Graph image descriptor used by Next.js Metadata images.
 * Appends title/subtitle (and optional tag) to `/api/og-image` URL.
 *
 * @param {string} title - Main title text.
 * @param {string} description - Subtitle text.
 * @param {string} alt - Alternative text for the image.
 * @param {string} [tag] - Optional short badge text to display.
 * @returns {{ url: string; width: number; height: number; alt: string }} Image descriptor.
 */
export function generateOgImageUrl(
  title: string,
  description: string,
  alt: string,
  tag?: string
): { url: string; width: number; height: number; alt: string } {
  const params = new URLSearchParams({ title, subtitle: description });
  if (tag) params.set('tag', tag);
  return {
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/og-image?${params}`,
    width: 1200,
    height: 630,
    alt,
  };
}
