import { MenuGroupType } from '@/types';

export const MENU_LIST: MenuGroupType[] = [
  {
    group: 'lotto',
    label: '로또',
    items: [
      {
        href: '/lotto/lotto-number',
        label: '로또 번호 추천',
        icon: 'Ticket',
        colorClass: 'text-indigo-500',
        description: '로또 번호를 무작위로 추천해드립니다.',
        example: '예: 로또 구매 전, 재미로 번호 조합이 필요할 때',
      },
    ],
  },
  {
    group: 'random',
    label: '랜덤 도구',
    items: [
      {
        href: '/random-picker/name-random',
        label: '항목 뽑기',
        icon: 'Wand2',
        colorClass: 'text-pink-500',
        description: '여러 명(상품, 번호, 메뉴) 중에서 무작위로 하나를 뽑아요.',
        example: '예: 경품 당첨자 선정, 점심 메뉴 결정 등',
      },
      {
        href: '/random-picker/seat-assignment',
        label: '자리 배정',
        icon: 'Layout',
        colorClass: 'text-orange-500',
        description: '참가자와 좌석 수를 입력하면 랜덤하게 자리를 배정합니다.',
        example: '예: 모임 자리 배치, 시험 좌석 배정 등',
      },
      {
        href: '/random-picker/team-assignment',
        label: '팀 배정',
        icon: 'Group',
        colorClass: 'text-violet-500',
        description: '인원과 팀 개수를 입력하면 랜덤하게 팀을 배정합니다.',
        example: '예: 워크숍 조 편성, 모임 팀 배정 등',
      },
      {
        href: '/random-picker/ladder-game',
        label: '사다리 타기',
        icon: 'SlidersHorizontal',
        colorClass: 'text-green-500',
        description:
          '참가자와 결과를 입력하면 랜덤하게 사다리 타기 결과를 보여줍니다.',
        example: '예: 점심 메뉴 결정, 벌칙 정하기, 역할 분배 등',
      },
      {
        href: '/random-picker/dice-game',
        label: '주사위 굴리기',
        icon: 'Dice5',
        colorClass: 'text-yellow-500',
        description: '가상 주사위를 굴려서 결과를 확인하세요.',
        example: '예: 순서 정하기, 게임 진행, 벌칙 정하기 등',
      },
      {
        href: '/random-picker/draw-order',
        label: '랜덤 매칭',
        icon: 'Shuffle',
        colorClass: 'text-orange-500',
        description: '참가자들을 랜덤하게 순서로 정렬합니다.',
        example: '예: 발표 순서, 게임 순서, 줄 서기 등',
      },
    ],
  },
  {
    group: 'quiz',
    label: 'AI 퀴즈/게임',
    items: [
      {
        href: '/quiz/english-word-quiz',
        label: '영어 단어 퀴즈',
        icon: 'SpellCheck',
        colorClass: 'text-green-500',
        description: '단어의 뜻을 보고 알맞은 영어 단어를 맞춰보세요.',
      },
      {
        href: '/quiz/trivia-quiz',
        label: '상식/지식 퀴즈',
        icon: 'Brain',
        colorClass: 'text-purple-500',
        description: '원하는 주제의 지식 및 상식 퀴즈를 풀어보세요.',
      },
      {
        href: '/quiz/four-idiom-quiz',
        label: '사자성어 맞추기',
        icon: 'ScrollText',
        colorClass: 'text-amber-500',
        description: '사자성어를 맞추는 퀴즈를 풀어보세요.',
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
