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

// SEC og 이미지 생성
export function generateOgImageUrl(
  title: string,
  description: string,
  alt: string
) {
  return {
    url: `${
      process.env.NEXT_PUBLIC_SITE_URL
    }/api/og-image?${new URLSearchParams({
      title,
      subtitle: description,
    })}`,
    width: 1200,
    height: 630,
    alt,
  };
}
