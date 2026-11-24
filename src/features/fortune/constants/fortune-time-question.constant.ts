/** 시각 질문 문구. 띠·별자리 찾기 화면과 궁합 panel이 같이 쓴다 */

/** 띠(입춘 시각) 시각 질문. {연도}, {M}, {D}, {HH:mm}을 바꿔 쓴다 */
export const FORTUNE_TTI_TIME_QUESTION_TEXTS = {
  timeIntro: '이 날은 입춘이 드는 날이라 태어난 시각에 따라 띠가 달라집니다.',
  timeBoundaryTemplate: '{연도}년 입춘은 {M}월 {D}일 {HH:mm}(한국 시간)입니다.',
} as const;

/** 별자리 시각 질문. {연도}년 {별자리} 시작 시각은 {M}월 {D}일 {HH:mm}(한국 시간)입니다. 조각으로 나눠 이어 쓴다 */
export const FORTUNE_STAR_SIGN_TIME_QUESTION_TEXTS = {
  intro:
    '이 날은 별자리가 바뀌는 날이라 태어난 시각에 따라 별자리가 달라집니다.',
  kst: '(한국 시간)',
} as const;
