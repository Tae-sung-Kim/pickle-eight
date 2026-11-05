import type { TarotCardType } from '@/features/tarot/types/tarot.type';

/** 완드 14장 (id 22~35, rank 1~14) */
export const TAROT_WANDS_CARDS = [
  {
    id: 22,
    arcana: 'minor',
    suit: 'wands',
    rank: 1,
    nameKo: '완드 에이스',
    nameEn: 'Ace of Wands',
    upright: {
      keywords: ['불씨', '시작', '열정'],
      summary:
        '새로운 일을 향한 의욕이 막 피어나는 때일 수 있습니다. 머릿속 구상을 작은 행동으로 옮겨 볼 만한 출발점입니다.',
    },
    reversed: {
      keywords: ['꺼진 불씨', '지연', '막힌 의욕'],
      summary:
        '의욕은 있는데 시작할 계기를 찾지 못해 맴돌고 있을 수 있습니다. 거창한 계획보다 오늘 할 수 있는 한 가지를 정하는 편이 길을 열어 줍니다.',
    },
  },
  {
    id: 23,
    arcana: 'minor',
    suit: 'wands',
    rank: 2,
    nameKo: '완드 2',
    nameEn: 'Two of Wands',
    upright: {
      keywords: ['계획', '선택', '전망'],
      summary:
        '지금 있는 자리에서 다음 방향을 정하려는 때를 나타냅니다. 가능성을 넓게 펼쳐 놓고 비교하는 과정이 필요할 수 있습니다.',
    },
    reversed: {
      keywords: ['망설임', '안주', '불확실'],
      summary:
        '익숙한 곳에 머물고 싶은 마음과 나아가고 싶은 마음이 부딪히는 모습일 수 있습니다. 결정을 미루는 이유를 먼저 적어 보면 실마리가 보이기도 합니다.',
    },
  },
  {
    id: 24,
    arcana: 'minor',
    suit: 'wands',
    rank: 3,
    nameKo: '완드 3',
    nameEn: 'Three of Wands',
    upright: {
      keywords: ['확장', '기대', '협력'],
      summary:
        '시작한 일이 조금씩 바깥으로 뻗어 나가며 반응을 기다리는 단계로 읽힙니다. 멀리 내다보는 시선이 힘이 됩니다.',
    },
    reversed: {
      keywords: ['답답함', '어긋난 기대', '재조정'],
      summary:
        '기대한 만큼 일이 빨리 펼쳐지지 않아 답답함이 커질 수 있습니다. 일정과 역할을 다시 맞추면 흐름이 풀리는 경우도 있습니다.',
    },
  },
  {
    id: 25,
    arcana: 'minor',
    suit: 'wands',
    rank: 4,
    nameKo: '완드 4',
    nameEn: 'Four of Wands',
    upright: {
      keywords: ['화합', '안정', '기념'],
      summary:
        '한 고비를 넘기고 주변과 기쁨을 나누기 좋은 시기입니다. 쌓아 온 기반을 확인하며 숨을 고르는 순간으로 볼 수 있습니다.',
    },
    reversed: {
      keywords: ['불안정한 기반', '어색함', '미완의 기쁨'],
      summary:
        '겉으로는 괜찮아 보여도 마음이 편치 않은 부분이 남아 있을 수 있습니다. 익숙한 자리에서 느껴지는 작은 불편함이 단서가 되기도 합니다.',
    },
  },
  {
    id: 26,
    arcana: 'minor',
    suit: 'wands',
    rank: 5,
    nameKo: '완드 5',
    nameEn: 'Five of Wands',
    upright: {
      keywords: ['경쟁', '의견 충돌', '자극'],
      summary:
        '서로 다른 주장이 부딪히며 분위기가 어수선해지는 때입니다. 다만 그 과정이 각자의 기준을 또렷하게 만드는 자극이 되기도 합니다.',
    },
    reversed: {
      keywords: ['갈등 완화', '소모전', '회피'],
      summary:
        '신경전이 잦아들거나 반대로 속으로만 쌓이는 모습일 수 있습니다. 승패보다 합의점을 살피는 쪽이 에너지를 아낄 수 있습니다.',
    },
  },
  {
    id: 27,
    arcana: 'minor',
    suit: 'wands',
    rank: 6,
    nameKo: '완드 6',
    nameEn: 'Six of Wands',
    upright: {
      keywords: ['인정', '성취', '자신감'],
      summary:
        '노력의 결과가 주변에 알려지고 격려를 받을 수 있는 흐름입니다. 자신감이 한층 단단해지는 계기가 됩니다.',
    },
    reversed: {
      keywords: ['자만', '평가 부담', '늦은 인정'],
      summary:
        '기대한 칭찬이 늦어지거나 평가에 지나치게 신경이 쓰이는 때일 수 있습니다. 남의 시선보다 스스로 만족하는 기준을 세워 볼 만합니다.',
    },
  },
  {
    id: 28,
    arcana: 'minor',
    suit: 'wands',
    rank: 7,
    nameKo: '완드 7',
    nameEn: 'Seven of Wands',
    upright: {
      keywords: ['방어', '소신', '버티기'],
      summary:
        '자기 입장을 지켜야 한다는 압박을 느끼는 때를 나타냅니다. 물러서지 않는 태도가 힘이 되지만 모든 것을 혼자 감당할 필요는 없습니다.',
    },
    reversed: {
      keywords: ['피로', '양보', '과민'],
      summary:
        '이어진 긴장에 지쳐 작은 말에도 예민해질 수 있습니다. 어디까지 지키고 무엇을 내려놓을지 우선순위를 가릴 시점입니다.',
    },
  },
  {
    id: 29,
    arcana: 'minor',
    suit: 'wands',
    rank: 8,
    nameKo: '완드 8',
    nameEn: 'Eight of Wands',
    upright: {
      keywords: ['속도', '소식', '진척'],
      summary:
        '멈춰 있던 일이 갑자기 빠르게 풀리는 느낌을 주는 카드입니다. 연락과 일정이 몰려오니 흐름을 놓치지 않는 것이 중요합니다.',
    },
    reversed: {
      keywords: ['정체', '엇갈림', '과속'],
      summary:
        '일정이 꼬이거나 연락이 엇갈려 흐름이 끊기는 듯할 수 있습니다. 서두를수록 빠뜨리는 것이 생기므로 점검 단계를 두면 좋습니다.',
    },
  },
  {
    id: 30,
    arcana: 'minor',
    suit: 'wands',
    rank: 9,
    nameKo: '완드 9',
    nameEn: 'Nine of Wands',
    upright: {
      keywords: ['끈기', '경계', '마지막 고비'],
      summary:
        '많이 지쳤지만 끝이 보이는 지점에서 한 번 더 버티는 힘을 나타냅니다. 지난 경험이 쌓여 쉽게 무너지지 않는 근성이 되어 있을 수 있습니다.',
    },
    reversed: {
      keywords: ['소진', '방어적 태도', '포기 충동'],
      summary:
        '오래 버틴 끝에 한계를 느끼고 내려놓고 싶어질 수 있습니다. 쉬어야 할 때와 접어야 할 때를 구분하라는 메시지로 읽힙니다.',
    },
  },
  {
    id: 31,
    arcana: 'minor',
    suit: 'wands',
    rank: 10,
    nameKo: '완드 10',
    nameEn: 'Ten of Wands',
    upright: {
      keywords: ['책임', '과부하', '끝이 보임'],
      summary:
        '맡은 일이 많아 어깨가 무거운 시기를 보여 줍니다. 목적지가 가까워질수록 나눌 수 있는 짐이 없는지 살펴볼 만합니다.',
    },
    reversed: {
      keywords: ['덜어 내기', '위임', '한계'],
      summary:
        '혼자 짊어진 부담을 덜어 내야 할 시점일 수 있습니다. 도움을 청하는 일은 약점이 아니라 효율적인 선택이 됩니다.',
    },
  },
  {
    id: 32,
    arcana: 'minor',
    suit: 'wands',
    rank: 11,
    nameKo: '완드 페이지',
    nameEn: 'Page of Wands',
    upright: {
      keywords: ['호기심', '탐색', '신선함'],
      summary:
        '새로운 분야에 대한 호기심이 솟아나는 성향입니다. 아직 서툴러도 일단 시도하려는 가벼운 태도가 장점입니다.',
    },
    reversed: {
      keywords: ['산만', '미숙함', '흥미 저하'],
      summary:
        '관심이 이리저리 옮겨 다녀 마무리가 아쉬운 모습일 수 있습니다. 시작한 일 가운데 정말 끌리는 것을 추려 보면 좋습니다.',
    },
  },
  {
    id: 33,
    arcana: 'minor',
    suit: 'wands',
    rank: 12,
    nameKo: '완드 나이트',
    nameEn: 'Knight of Wands',
    upright: {
      keywords: ['돌진', '모험심', '열의'],
      summary:
        '열정이 앞서 곧장 달려가는 추진형의 태도입니다. 활력은 크지만 주변의 속도와 맞추는 감각도 함께 필요합니다.',
    },
    reversed: {
      keywords: ['충동', '조급', '변덕'],
      summary:
        '열의가 불꽃처럼 번졌다가 금세 식는 변덕으로 이어질 수 있습니다. 한 호흡 쉬며 목표를 점검하면 에너지를 아낄 수 있습니다.',
    },
  },
  {
    id: 34,
    arcana: 'minor',
    suit: 'wands',
    rank: 13,
    nameKo: '완드 퀸',
    nameEn: 'Queen of Wands',
    upright: {
      keywords: ['매력', '자신감', '포용'],
      summary:
        '활기와 따뜻함으로 주변을 끌어당기는 태도를 나타냅니다. 스스로를 편안하게 드러내는 모습이 사람들에게 안정감을 줍니다.',
    },
    reversed: {
      keywords: ['질투', '흔들리는 자존감', '관심 욕구'],
      summary:
        '자신감이 흔들릴 때 타인의 반응에 예민해지는 면이 드러날 수 있습니다. 비교보다 나의 강점을 떠올리는 시간이 도움이 됩니다.',
    },
  },
  {
    id: 35,
    arcana: 'minor',
    suit: 'wands',
    rank: 14,
    nameKo: '완드 킹',
    nameEn: 'King of Wands',
    upright: {
      keywords: ['비전', '리더십', '결단력'],
      summary:
        '큰 그림을 그리고 사람들을 이끌어 가는 성향과 닿아 있습니다. 열정을 구체적인 방향으로 바꾸는 힘이 돋보입니다.',
    },
    reversed: {
      keywords: ['독단', '과욕', '성급한 지시'],
      summary:
        '의욕이 지나쳐 주변 의견을 듣지 않고 밀어붙이는 면이 나타날 수 있습니다. 함께 가는 사람들의 사정을 살피는 여유가 필요합니다.',
    },
  },
] as const satisfies readonly TarotCardType[];
