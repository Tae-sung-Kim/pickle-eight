/** 화면 라벨·제목·설명 문구 */
export const NO_SON_DAYS_VIEW = {
  weekdays: ['일', '월', '화', '수', '목', '금', '토'],
  weekdayNames: [
    '일요일',
    '월요일',
    '화요일',
    '수요일',
    '목요일',
    '금요일',
    '토요일',
  ],
  badge: { noSon: '손', leap: '윤' },
  hub: {
    title: '손 없는 날 달력',
    description:
      '오늘이 손 없는 날인지, 다음 손 없는 날은 언제인지 양력 달력에서 확인하세요.',
  },
  year: {
    title: (year: number) => `${year}년 손 없는 날`,
    description: (year: number) =>
      `${year}년 1월부터 12월까지 손 없는 날을 양력 날짜와 음력 날짜로 정리했습니다.`,
    calendarHeading: '달력으로 보기',
  },
  today: {
    heading: '오늘',
    isNoSon: '오늘은 손 없는 날입니다',
    isNotNoSon: '오늘은 손 없는 날이 아닙니다',
    outOfRange: '오늘 날짜가 달력 표시 범위(2026년 1월~2049년 12월) 밖입니다.',
  },
  next: {
    heading: '다음 손 없는 날',
    tomorrow: '내일',
    daysLater: (n: number) => `${n}일 뒤`,
    none: '표시 범위 안에는 다음 손 없는 날이 없습니다.',
  },
  dateLine: {
    solar: (month: number, day: number, weekdayName: string) =>
      `${month}월 ${day}일 ${weekdayName}`,
    lunar: (month: number, day: number, isLeap: boolean) =>
      `음력 ${isLeap ? '윤' : ''}${month}월 ${day}일`,
  },
  calendar: {
    prev: '이전 달',
    next: '다음 달',
    legend: {
      noSon: '손 없는 날',
      today: '오늘',
      note: '작은 숫자는 음력, 윤은 윤달',
    },
    monthSummary: (month: number, days: readonly number[]) =>
      `${month}월 손 없는 날 ${days.length}일: ${days.map((d) => `${d}일`).join(', ')}`,
  },
  yearLinks: { heading: '연도별 손 없는 날' },
  monthCard: {
    title: (month: number) => `${month}월`,
    count: (n: number) => `손 없는 날 ${n}일`,
  },
  monthJumpLabel: '월 바로가기',
  backToHub: '이번 달 손 없는 날 달력 보기',
} as const;
