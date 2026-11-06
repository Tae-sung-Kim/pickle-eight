import type { MenuGroupType } from '@/types/menu.type';

export enum MENU_GROUP_NAME_ENUM {
  LOTTO = 'lotto',
  TAROT = 'tarot',
  FORTUNE = 'fortune',
  LUNCH = 'lunch',
  WHERE = 'where',
}

export const MENU_LIST: MenuGroupType[] = [
  {
    group: MENU_GROUP_NAME_ENUM.LOTTO,
    label: '로또',
    href: `/${MENU_GROUP_NAME_ENUM.LOTTO}`,
    items: [
      {
        href: `/${MENU_GROUP_NAME_ENUM.LOTTO}/generator`,
        label: '번호 생성기',
        icon: 'Ticket',
        colorClass: 'text-primary',
        description:
          'CSPRNG 기반 무작위 생성. 고급 옵션으로 합계·연속·홀짝·고정/제외 번호·가중치 조건도 설정.',
        example:
          '예: 구매 전 재미로 번호가 필요할 때, 합계 100~200·7번 고정 조건으로 생성',
      },
      {
        href: `/${MENU_GROUP_NAME_ENUM.LOTTO}/history`,
        label: '회차별 당첨 결과',
        icon: 'CalendarSearch',
        colorClass: 'text-primary',
        description: '범위를 지정해 과거 당첨 번호 조회.',
        example: '예: 최근 50회 결과 확인',
      },
      {
        href: `/${MENU_GROUP_NAME_ENUM.LOTTO}/check`,
        label: '번호 채점기',
        icon: 'CheckCircle2',
        colorClass: 'text-primary',
        description: '내 번호와 회차를 비교해 등수 확인.',
        example: '예: 1100회 채점',
      },
      {
        href: `/${MENU_GROUP_NAME_ENUM.LOTTO}/my-numbers`,
        label: '나의 번호',
        icon: 'Bookmark',
        colorClass: 'text-primary',
        description:
          '번호를 저장하면 저장 이후 추첨되는 회차와 자동 비교해 등수 확인.',
        example: '예: 매주 고정 번호 보관, 생성한 번호 저장 후 당첨 확인',
      },
      {
        href: `/${MENU_GROUP_NAME_ENUM.LOTTO}/analysis`,
        label: '통계/패턴 분석',
        icon: 'BarChart2',
        colorClass: 'text-primary',
        description: '빈도, 구간, 홀짝, 합계, 연속수, 핫/콜드/지연 번호 분석.',
        example: '예: 1~200회 빈도 상위/하위 번호, 오래 안 나온 번호',
      },
      {
        href: `/${MENU_GROUP_NAME_ENUM.LOTTO}/simulator`,
        label: '로또 시뮬레이터',
        icon: 'PlayCircle',
        colorClass: 'text-primary',
        description: '다회 추첨으로 등수 분포 시뮬레이션.',
        example: '예: 5티켓 × 10,000회',
      },
    ],
  },
  {
    group: MENU_GROUP_NAME_ENUM.TAROT,
    label: '타로',
    href: `/${MENU_GROUP_NAME_ENUM.TAROT}/daily`,
    items: [
      {
        href: `/${MENU_GROUP_NAME_ENUM.TAROT}/daily`,
        label: '오늘의 타로',
        icon: 'Moon',
        colorClass: 'text-menu-tarot',
        description: '카드 한 장을 뽑아 오늘의 흐름을 확인.',
        example: '예: 출근 전, 오늘 하루 분위기가 궁금할 때',
      },
      {
        href: `/${MENU_GROUP_NAME_ENUM.TAROT}/three-card`,
        label: '3장 타로 (과거·현재·미래)',
        icon: 'Layers',
        colorClass: 'text-menu-tarot',
        description: '카드 세 장으로 과거·현재·미래의 흐름을 정리.',
        example: '예: 고민되는 일의 흐름을 차분히 정리해 보고 싶을 때',
      },
    ],
  },
  {
    group: MENU_GROUP_NAME_ENUM.FORTUNE,
    label: '운세',
    href: `/${MENU_GROUP_NAME_ENUM.FORTUNE}`,
    items: [
      {
        href: `/${MENU_GROUP_NAME_ENUM.FORTUNE}/today`,
        label: '오늘의 운세',
        icon: 'Star',
        colorClass: 'text-menu-fortune',
        description: '생년월일로 오늘의 총운과 행운 포인트를 확인.',
        example: '예: 출근 전에 오늘의 총운과 재물·애정 운세 확인',
      },
      {
        href: `/${MENU_GROUP_NAME_ENUM.FORTUNE}/tti`,
        label: '띠별 운세',
        icon: 'PawPrint',
        colorClass: 'text-menu-fortune',
        description: '12띠의 오늘 운세와 입춘 기준 내 띠 찾기.',
        example: '예: 1~2월생이 입춘·설날 기준 띠를 함께 확인',
      },
      {
        href: `/${MENU_GROUP_NAME_ENUM.FORTUNE}/star-sign`,
        label: '별자리 운세',
        icon: 'Telescope',
        colorClass: 'text-menu-fortune',
        description:
          '12별자리의 오늘 운세와 경계일 시각까지 반영한 내 별자리 찾기.',
        example: '예: 3월 20일생이 태어난 시각으로 별자리 확인',
      },
    ],
  },
  {
    group: MENU_GROUP_NAME_ENUM.LUNCH,
    label: '점심',
    href: `/${MENU_GROUP_NAME_ENUM.LUNCH}/today`,
    comingSoon: true,
    items: [
      {
        href: `/${MENU_GROUP_NAME_ENUM.LUNCH}/today`,
        label: '오늘 뭐 먹지',
        icon: 'Utensils',
        colorClass: 'text-orange-600',
        description: '직장인 점심 메뉴를 조건에 맞게 추천하고 룰렛으로 결정.',
        example: '예: 한식/중식, 가격대, 혼밥 조건으로 고르기',
      },
    ],
  },
  {
    group: MENU_GROUP_NAME_ENUM.WHERE,
    label: '나들이',
    href: `/${MENU_GROUP_NAME_ENUM.WHERE}/today`,
    comingSoon: true,
    items: [
      {
        href: `/${MENU_GROUP_NAME_ENUM.WHERE}/today`,
        label: '오늘 어디가',
        icon: 'MapPin',
        colorClass: 'text-sky-600',
        description: '공공데이터 기반으로 오늘 가볼 만한 곳을 추천.',
        example: '예: 내 주변 축제, 공연, 전시, 나들이 장소 찾기',
      },
    ],
  },
  // {
  //   group: 'board',
  //   label: '게시판',
  //   items: [
  //     {
  //       href: '/feedback',
  //       label: '건의사항',
  //       description: '건의사항을 확인할 수 있습니다.',
  //     },
  //   ],
  // },
];
