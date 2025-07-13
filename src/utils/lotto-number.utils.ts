// 로또 랜덤 번호 추출
export function generateLottoNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 6) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// 로또 번호에 따른 색상 클래스 반환
export function getNumberColor(num: number): string {
  if (num <= 10) return 'bg-red-100 text-red-800';
  if (num <= 20) return 'bg-blue-100 text-blue-800';
  if (num <= 30) return 'bg-yellow-100 text-yellow-800';
  if (num <= 40) return 'bg-gray-100 text-gray-800';
  return 'bg-green-100 text-green-800';
}
