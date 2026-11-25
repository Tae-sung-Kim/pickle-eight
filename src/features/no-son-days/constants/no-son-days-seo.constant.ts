/** SEO 문구 (design.md 8장). 연도 값은 함수로 채운다 */
export const NO_SON_DAYS_SEO = {
  hub: {
    title: '손 없는 날 달력 - 이번 달 손없는날과 다음 손 없는 날',
    description:
      '오늘이 손 없는 날인지, 다음 손 없는 날이 언제인지, 이번 달 손 없는 날이 양력 며칠인지 음력 날짜와 함께 확인하세요. 음력 날짜 끝자리가 9·0인 날을 기준으로 계산합니다.',
    keywords: [
      '손 없는 날',
      '손없는날',
      '손없는날 달력',
      '손없는날 계산',
      '음력 9일 10일 손없는날',
      '이사 날짜 손 없는 날',
    ],
    ogAlt: '손 없는 날 달력',
    breadcrumbName: '손 없는 날 달력',
  },
  ogTag: '손 없는 날',
  year: {
    title: (year: number) =>
      `${year}년 손 없는 날 달력 - ${year} 손없는날 월별 목록`,
    description: (year: number) =>
      `${year}년 1월부터 12월까지 손 없는 날(음력 9·10·19·20·29·30일)을 양력 날짜, 요일, 음력 날짜로 정리했습니다. 민간 풍습 기준의 참고용 달력입니다.`,
    keywords: (year: number) => [
      `${year} 손없는날`,
      `${year}년 손 없는 날`,
      `${year} 손없는날 달력`,
      '손 없는 날',
    ],
    ogAlt: (year: number) => `${year}년 손 없는 날 달력`,
    breadcrumbName: (year: number) => `${year}년 손 없는 날`,
  },
} as const;
