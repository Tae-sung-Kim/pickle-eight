/*
 * Centralized SEO keyword lists to keep consistency across pages.
 * Use Korean terms as primary since site language is Korean.
 */

export const GLOBAL_KEYWORDS: readonly string[] = [
  // Lotto core
  '로또',
  '로또 채점',
  '로또 당첨 확인',
  '로또 당첨 번호',
  '로또 당첨 결과 조회',
  '로또 실시간 결과',
  '로또 회차 조회',
  '로또 보너스 번호',
  '로또 번호 생성기',
  '로또 번호 자동 생성',
  '로또 번호 추천',
  '로또 번호 추천기',
  '로또 번호 분석',
  '로또 통계 분석',
  '로또 패턴 분석',
  '로또 시뮬레이터',

  // Random picker tools
  '랜덤 추첨기',
  '랜덤 뽑기',
  '랜덤 선택',
  '랜덤픽',
  '공정한 추첨',
  '추첨 결과 공유',
  '캡처 공유',
  '링크로 공유',

  // Name/seat/team/ladder/dice/order
  '이름 추첨기',
  '항목 뽑기',
  '메뉴 뽑기',
  '경품 추첨',
  '자리 배정기',
  '자리 추첨',
  '자리 배치 랜덤',
  '팀 나누기 도구',
  '랜덤 팀 배정',
  '사다리타기 온라인',
  '벌칙 정하기',
  '랜덤 결정',
  '온라인 주사위',
  '주사위 굴리기',
  '순서 정하기',
  '랜덤 순서',
  '랜덤 매칭',

  // Today / message / luck / todos
  '오늘의 행운',
  '오늘의 운세',
  '오늘의 응원',
  '오늘의 메시지',
  '데일리 메시지',
  '오늘 할 일 추천',

  // Menu recommendation
  '오늘 뭐 먹지',
  '점심 메뉴 추천',
  '저녁 메뉴 추천',
  '시간대별 메뉴 추천',
  '날씨별 메뉴 추천',

  // AI Quiz / Games (GPT-based)
  'AI 퀴즈',
  'GPT 퀴즈',
  'GPT 모델 선택',
  '기본 모델 무료 퀴즈',
  '무료 퀴즈 게임',
  '랜덤 퀴즈',
  '한국어 퀴즈',
  '한글 퀴즈',
  '상식 퀴즈',
  '일반상식 테스트',
  '지식 퀴즈',
  '영단어 퀴즈',
  '단어 뜻 맞추기',
  '어휘 퀴즈',
  '사자성어 퀴즈',
  '사자성어 뜻 맞추기',
  '한자성어 퀴즈',
  '이모지 퀴즈',
  '이모지 맞추기',
  '이모지 해석 게임',
  '숫자 맞추기 게임',
  '숫자 매칭 게임',

  // Attributes / platform
  '무료 랜덤 도구',
  '간편 공유',
  '모바일 최적화',
  '웹앱',
  'PWA',
] as const;

export type SeoKeywordGroup = Readonly<{
  name: string;
  keywords: readonly string[];
}>;

export function buildKeywords(
  ...groups: readonly (readonly string[] | undefined)[]
): string[] {
  const set = new Set<string>();
  for (const g of groups) {
    if (!g) continue;
    for (const k of g) set.add(k);
  }
  return Array.from(set);
}
