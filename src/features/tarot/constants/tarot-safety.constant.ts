import { CRISIS_TERMS } from '@/constants/crisis-term.constant';

/** 위기 표현 감지 목록. 원본은 공용 `CRISIS_TERMS`(타로·꿈 해몽 공용). */
export const TAROT_CRISIS_TERMS: readonly string[] = CRISIS_TERMS;

/**
 * 전문가 상담 안내 감지 목록(부분 일치). 정규화 규칙은 위기 목록과 같다.
 * 단독 "암", "약", "법", "선물"은 오탐이 많아 넣지 않는다.
 */
export const TAROT_EXPERT_TERMS: readonly string[] = [
  // 건강
  '진단',
  '수술',
  '치료',
  '병원',
  '질병',
  '투병',
  '항암',
  '암진단',
  '암수술',
  '암검사',
  '우울증',
  '공황장애',
  '처방',
  // 법률
  '소송',
  '고소',
  '고발',
  '재판',
  '변호사',
  '법원',
  '합의금',
  '형사처벌',
  // 투자·금융
  '주식',
  '코인',
  '비트코인',
  '가상화폐',
  '투자',
  '대출',
  '부동산',
  '청약',
  '매수',
  '매도',
];
