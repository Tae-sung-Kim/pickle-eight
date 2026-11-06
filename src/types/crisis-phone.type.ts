export type CrisisPhoneType = Readonly<{
  id: string;
  /** 기관 이름 (번호 제외). 예: '자살예방 상담전화' */
  name: string;
  /** 검사·비교용 번호. 예: '109', '1577-0199' */
  number: string;
  /** 화면 표기 (하이픈 포함) */
  displayNumber: string;
  /** 'tel:109' 등. 숫자만 쓴다. 터치 상태 링크에서만 쓴다 */
  href: string;
  /** 상담 분야 설명. 예: '자살 생각과 위기 상황 상담' */
  description: string;
  /** 타로 위기 패널 노출 여부 (109는 주 버튼, 나머지는 "다른 상담전화" 링크) */
  showInCrisisPanel: boolean;
}>;
