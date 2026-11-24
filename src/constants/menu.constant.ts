import { FORTUNE_COMPATIBILITY_MENU_TEXTS } from '@/features/fortune/constants/fortune-compatibility-menu.constant';
import { FORTUNE_COMPATIBILITY_ROUTES } from '@/features/fortune/constants/fortune-compatibility-route.constant';
import type { MenuGroupType } from '@/types/menu.type';

export enum MENU_GROUP_NAME_ENUM {
  LOTTO = 'lotto',
  MEAL = 'meal',
  TAROT = 'tarot',
  FORTUNE = 'fortune',
  DREAM = 'dream',
  LUCKY_DRAW = 'lucky-draw',
}

export const MENU_LIST: MenuGroupType[] = [
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
      {
        href: FORTUNE_COMPATIBILITY_ROUTES.hub,
        label: FORTUNE_COMPATIBILITY_MENU_TEXTS.label,
        icon: 'HeartHandshake',
        colorClass: 'text-menu-fortune',
        description: FORTUNE_COMPATIBILITY_MENU_TEXTS.description,
        example: FORTUNE_COMPATIBILITY_MENU_TEXTS.example,
      },
      {
        href: `/${MENU_GROUP_NAME_ENUM.FORTUNE}/saju`,
        label: '사주',
        icon: 'ScrollText',
        colorClass: 'text-menu-fortune',
        description:
          '태어난 연·월·일·시로 기둥을 세우고 오늘 일진(오늘 날짜의 천간)과 비교.',
        example: '예: 태어난 시간을 몰라도 연·월·일 기둥으로 확인',
      },
    ],
  },
  {
    group: MENU_GROUP_NAME_ENUM.MEAL,
    label: '뭐 먹지',
    href: `/${MENU_GROUP_NAME_ENUM.MEAL}`,
    items: [
      {
        href: `/${MENU_GROUP_NAME_ENUM.MEAL}`,
        label: '오늘 뭐 먹지',
        icon: 'Utensils',
        colorClass: 'text-menu-meal',
        description:
          '룰렛으로 아침·점심·저녁 메뉴를 무작위로 뽑고 지도에서 찾아보기.',
        example: '예: 한식·분식만 골라 국물 메뉴로 룰렛 돌리기',
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
        description: '카드 한 장으로 가볍게 보는 오늘의 흐름.',
        example: '예: 출근 전, 오늘 하루 분위기가 궁금할 때',
      },
      {
        href: `/${MENU_GROUP_NAME_ENUM.TAROT}/three-card`,
        label: '3장 타로 (과거·현재·미래)',
        icon: 'Layers',
        colorClass: 'text-menu-tarot',
        description: '세 장의 흐름을 이야기로 엮어 고민을 정리.',
        example: '예: 고민되는 일의 흐름을 차분히 정리해 보고 싶을 때',
      },
    ],
  },
  {
    group: MENU_GROUP_NAME_ENUM.LUCKY_DRAW,
    label: '운빨 뽑기',
    href: `/${MENU_GROUP_NAME_ENUM.LUCKY_DRAW}`,
    items: [
      {
        href: `/${MENU_GROUP_NAME_ENUM.LUCKY_DRAW}/ladder`,
        label: '사다리 타기',
        icon: 'Columns3',
        colorClass: 'text-menu-lucky',
        description: '이름과 결과를 짝지어 누가 무엇을 맡을지 정해요.',
        example: '예: 4명이 청소 당번 정하기',
      },
      {
        href: `/${MENU_GROUP_NAME_ENUM.LUCKY_DRAW}/roulette`,
        label: '돌림판',
        icon: 'LoaderPinwheel',
        colorClass: 'text-menu-lucky',
        description: '항목 중 하나를 돌림판으로 골라요.',
        example: '예: 후보 여러 개 중 하나 고르기',
      },
      {
        href: `/${MENU_GROUP_NAME_ENUM.LUCKY_DRAW}/lots`,
        label: '제비뽑기',
        icon: 'Shuffle',
        colorClass: 'text-menu-lucky',
        description: '뒷면 카드를 한 장씩 열어 항목을 하나씩 뽑아요.',
        example: '예: 발표 주제 카드를 한 장씩 뽑기',
      },
    ],
  },
  {
    group: MENU_GROUP_NAME_ENUM.DREAM,
    label: '꿈 해몽',
    href: `/${MENU_GROUP_NAME_ENUM.DREAM}`,
    items: [
      {
        href: `/${MENU_GROUP_NAME_ENUM.DREAM}`,
        label: '꿈 소재 찾기',
        icon: 'BookOpenText',
        colorClass: 'text-menu-dream',
        description:
          '꿈에 나온 소재를 찾아 민간 풀이와 생각해 볼 점을 읽는 사전.',
        example: '예: 돼지, 치아처럼 떠오른 소재로 찾기',
      },
    ],
  },
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
