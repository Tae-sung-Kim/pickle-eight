import type { TarotCardType } from '@/features/tarot/types/tarot.type';

/** 펜타클 14장 (id 64~77, rank 1~14) */
export const TAROT_PENTACLES_CARDS = [
  {
    id: 64,
    arcana: 'minor',
    suit: 'pentacles',
    rank: 1,
    nameKo: '펜타클 에이스',
    nameEn: 'Ace of Pentacles',
    upright: {
      keywords: ['현실의 씨앗', '기회', '기반'],
      summary:
        '생활에 쓸모 있는 새로운 가능성이 손에 잡히는 시작입니다. 작더라도 꾸준히 가꿀 기반을 마련하기 좋은 때입니다.',
    },
    reversed: {
      keywords: ['놓친 기회', '준비 부족', '불발'],
      summary:
        '눈앞의 가능성을 살리지 못하거나 준비가 덜 되어 머뭇거릴 수 있습니다. 부족한 부분을 확인하고 다시 출발해도 늦지 않습니다.',
    },
  },
  {
    id: 65,
    arcana: 'minor',
    suit: 'pentacles',
    rank: 2,
    nameKo: '펜타클 2',
    nameEn: 'Two of Pentacles',
    upright: {
      keywords: ['조율', '유연성', '균형'],
      summary:
        '여러 일과 생활을 동시에 돌리며 균형을 잡아야 하는 시기입니다. 변화에 맞춰 가볍게 움직이는 감각이 도움이 됩니다.',
    },
    reversed: {
      keywords: ['과부하', '우선순위 혼란', '흔들림'],
      summary:
        '할 일이 쌓여 균형이 무너지기 쉬운 때일 수 있습니다. 내려놓을 항목을 정하는 데서 숨통이 트입니다.',
    },
  },
  {
    id: 66,
    arcana: 'minor',
    suit: 'pentacles',
    rank: 3,
    nameKo: '펜타클 3',
    nameEn: 'Three of Pentacles',
    upright: {
      keywords: ['협업', '숙련', '인정'],
      summary:
        '각자의 역량이 맞물려 결과물이 다듬어지는 과정을 나타냅니다. 함께 일하며 서로의 전문성을 존중하는 태도가 중요합니다.',
    },
    reversed: {
      keywords: ['손발 불일치', '대충 처리', '소통 부재'],
      summary:
        '역할이 겹치거나 소통이 어긋나 완성도가 떨어질 수 있습니다. 기준을 먼저 맞추면 불필요한 수정이 줄어듭니다.',
    },
  },
  {
    id: 67,
    arcana: 'minor',
    suit: 'pentacles',
    rank: 4,
    nameKo: '펜타클 4',
    nameEn: 'Four of Pentacles',
    upright: {
      keywords: ['절약', '안정 추구', '보존'],
      summary:
        '가진 것을 지키고 생활의 안정을 우선하는 태도를 나타냅니다. 적절한 대비는 여유가 되나 지나치면 마음의 문까지 닫힐 수 있습니다.',
    },
    reversed: {
      keywords: ['인색함', '집착', '놓지 못함'],
      summary:
        '움켜쥐려는 마음이 커져 관계와 기회가 좁아질 수 있습니다. 조금씩 나누고 열어 보는 연습이 필요합니다.',
    },
  },
  {
    id: 68,
    arcana: 'minor',
    suit: 'pentacles',
    rank: 5,
    nameKo: '펜타클 5',
    nameEn: 'Five of Pentacles',
    upright: {
      keywords: ['결핍감', '고단함', '도움 청하기'],
      summary:
        '생활이 빠듯하게 느껴지고 외로움이 겹치는 시기일 수 있습니다. 주변에 열려 있는 도움의 손길을 살피는 일이 중요합니다.',
    },
    reversed: {
      keywords: ['회복', '지지', '숨통'],
      summary:
        '어려웠던 형편이 조금씩 풀리고 지지를 받는 흐름입니다. 어려웠던 때를 돌이켜 생활 습관을 정비할 여지도 있습니다.',
    },
  },
  {
    id: 69,
    arcana: 'minor',
    suit: 'pentacles',
    rank: 6,
    nameKo: '펜타클 6',
    nameEn: 'Six of Pentacles',
    upright: {
      keywords: ['나눔', '균형 있는 교환', '감사'],
      summary:
        '주고받음이 공정하게 이루어지는 관계를 나타냅니다. 베풂과 도움을 자연스럽게 받아들이는 열린 자세가 어울립니다.',
    },
    reversed: {
      keywords: ['불공평', '조건부 호의', '빚진 마음'],
      summary:
        '주고받는 무게가 기울어 불편함이 남을 수 있습니다. 기대하는 바를 분명히 말하면 오해가 줄어듭니다.',
    },
  },
  {
    id: 70,
    arcana: 'minor',
    suit: 'pentacles',
    rank: 7,
    nameKo: '펜타클 7',
    nameEn: 'Seven of Pentacles',
    upright: {
      keywords: ['인내', '점검', '장기 관점'],
      summary:
        '심은 것이 자라기를 기다리며 지금까지의 과정을 가늠하는 시기입니다. 당장의 성과가 보이지 않아도 방향이 맞는지 살피는 일이 도움이 됩니다.',
    },
    reversed: {
      keywords: ['조급', '성과 불안', '방향 재검토'],
      summary:
        '더딘 진행에 마음이 앞서 흔들릴 수 있습니다. 쏟아 온 노력의 방식을 다시 점검할 때입니다.',
    },
  },
  {
    id: 71,
    arcana: 'minor',
    suit: 'pentacles',
    rank: 8,
    nameKo: '펜타클 8',
    nameEn: 'Eight of Pentacles',
    upright: {
      keywords: ['숙련', '꾸준함', '집중'],
      summary:
        '한 가지에 몰입해 솜씨를 갈고닦는 모습입니다. 반복에서 오는 안정감이 실력을 한층 단단하게 합니다.',
    },
    reversed: {
      keywords: ['타성', '완벽주의', '지루함'],
      summary:
        '반복이 지겨워 대충 넘기거나 완벽에 매달려 진전이 더딜 수 있습니다. 목표를 작게 나누면 다시 몰입하기 쉬워집니다.',
    },
  },
  {
    id: 72,
    arcana: 'minor',
    suit: 'pentacles',
    rank: 9,
    nameKo: '펜타클 9',
    nameEn: 'Nine of Pentacles',
    upright: {
      keywords: ['자립', '여유', '자기만족'],
      summary:
        '스스로 가꾼 생활 속에서 느끼는 안정과 품위를 나타냅니다. 혼자서도 충분히 누릴 줄 아는 여유가 돋보입니다.',
    },
    reversed: {
      keywords: ['과시', '불안한 여유', '외로움'],
      summary:
        '겉모습과 달리 속으로는 외롭거나 불안정할 수 있습니다. 보이는 것보다 내실을 살피는 시간이 필요합니다.',
    },
  },
  {
    id: 73,
    arcana: 'minor',
    suit: 'pentacles',
    rank: 10,
    nameKo: '펜타클 10',
    nameEn: 'Ten of Pentacles',
    upright: {
      keywords: ['지속성', '가족과 공동체', '유산'],
      summary:
        '오랜 시간 쌓인 안정이 다음 세대나 주변과 이어지는 모습입니다. 가까운 사람들과 함께 지켜 가는 가치를 되새길 수 있습니다.',
    },
    reversed: {
      keywords: ['흔들리는 기반', '갈등', '단절'],
      summary:
        '집안이나 공동체 안의 기대 차이로 불편함이 생길 수 있습니다. 오래된 방식을 다시 조율해 볼 때입니다.',
    },
  },
  {
    id: 74,
    arcana: 'minor',
    suit: 'pentacles',
    rank: 11,
    nameKo: '펜타클 페이지',
    nameEn: 'Page of Pentacles',
    upright: {
      keywords: ['배움', '성실', '실용성'],
      summary:
        '차근차근 익히며 현실에 쓸모 있는 것을 만들려는 성향입니다. 작은 목표를 세워 꾸준히 해 나가는 태도가 어울립니다.',
    },
    reversed: {
      keywords: ['미루기', '비현실적 계획', '집중력 저하'],
      summary:
        '계획만 세우고 실행이 늦어지거나 흥미가 쉽게 흩어질 수 있습니다. 오늘 할 수 있는 분량부터 정해 볼 만합니다.',
    },
  },
  {
    id: 75,
    arcana: 'minor',
    suit: 'pentacles',
    rank: 12,
    nameKo: '펜타클 나이트',
    nameEn: 'Knight of Pentacles',
    upright: {
      keywords: ['꾸준함', '신중함', '책임감'],
      summary:
        '서두르지 않고 한 걸음씩 착실히 나아가는 성향입니다. 믿음직하고 끈기 있는 모습이 강점입니다.',
    },
    reversed: {
      keywords: ['정체', '고지식함', '답답함'],
      summary:
        '신중함이 지나쳐 변화를 거부하거나 진행이 느려질 수 있습니다. 때로는 방식을 바꾸는 유연함이 필요합니다.',
    },
  },
  {
    id: 76,
    arcana: 'minor',
    suit: 'pentacles',
    rank: 13,
    nameKo: '펜타클 퀸',
    nameEn: 'Queen of Pentacles',
    upright: {
      keywords: ['살림', '현실 감각', '돌봄'],
      summary:
        '생활을 넉넉하게 가꾸고 주변을 살뜰히 챙기는 성향입니다. 현실적인 감각과 따뜻함이 함께 드러납니다.',
    },
    reversed: {
      keywords: ['일 과다', '자기 소홀', '집착'],
      summary:
        '챙기느라 정작 자신을 돌보지 못하거나 걱정이 앞서 여유가 줄 수 있습니다. 쉬는 시간을 일정에 먼저 넣어 두는 방식이 도움이 됩니다.',
    },
  },
  {
    id: 77,
    arcana: 'minor',
    suit: 'pentacles',
    rank: 14,
    nameKo: '펜타클 킹',
    nameEn: 'King of Pentacles',
    upright: {
      keywords: ['안정감', '책임', '든든함'],
      summary:
        '오랜 노력으로 단단한 기반을 다진 믿음직한 성향입니다. 현실을 꼼꼼히 관리하며 주변에 안정감을 줍니다.',
    },
    reversed: {
      keywords: ['완고함', '소유욕', '경직된 관리'],
      summary:
        '지키려는 마음이 강해 융통성이 줄어들 수 있습니다. 통제보다 신뢰에 기대는 편이 관계를 부드럽게 합니다.',
    },
  },
] as const satisfies readonly TarotCardType[];
