// 날짜 return
export const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// 24시간제 리턴
export function getKoreanTimeString(date: Date): string {
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
