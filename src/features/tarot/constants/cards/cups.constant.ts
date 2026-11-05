import type { TarotCardType } from '@/features/tarot/types/tarot.type';

/** 컵 14장 (id 36~49, rank 1~14) */
export const TAROT_CUPS_CARDS = [
  {
    id: 36,
    arcana: 'minor',
    suit: 'cups',
    rank: 1,
    nameKo: '컵 에이스',
    nameEn: 'Ace of Cups',
    upright: {
      keywords: ['새 감정', '열린 마음', '공감'],
      summary:
        '마음에 새로운 감정이 차오르는 시작을 나타냅니다. 다정함을 주고받을 문이 열리는 때일 수 있습니다.',
    },
    reversed: {
      keywords: ['억눌린 감정', '공허함', '표현 부족'],
      summary:
        '느낌은 있으나 입 밖으로 꺼내기 어려워 마음이 막혀 있을 수 있습니다. 감정에 이름을 붙여 적어 보는 것만으로도 숨통이 트이기도 합니다.',
    },
  },
  {
    id: 37,
    arcana: 'minor',
    suit: 'cups',
    rank: 2,
    nameKo: '컵 2',
    nameEn: 'Two of Cups',
    upright: {
      keywords: ['교감', '상호 존중', '신뢰'],
      summary:
        '둘 사이에서 같은 온도로 마음을 나누는 상태를 가리킵니다. 관계의 균형이 맞아 편안함이 생기는 시기일 수 있습니다.',
    },
    reversed: {
      keywords: ['불균형', '오해', '거리감'],
      summary:
        '주고받는 마음의 크기가 달라 서운함이 쌓일 수 있습니다. 서로의 기대를 말로 확인하는 대화가 필요한 때입니다.',
    },
  },
  {
    id: 38,
    arcana: 'minor',
    suit: 'cups',
    rank: 3,
    nameKo: '컵 3',
    nameEn: 'Three of Cups',
    upright: {
      keywords: ['우정', '어울림', '나눔'],
      summary:
        '가까운 사람들과 즐거움을 함께하는 시간이 어울립니다. 소소한 모임이 마음의 활력이 되어 줍니다.',
    },
    reversed: {
      keywords: ['과한 모임', '소외감', '뒷말'],
      summary:
        '모임이 지나치게 늘어 피로하거나 그 안에서 겉도는 기분이 들 수 있습니다. 편한 사람과의 깊은 시간을 먼저 챙겨 볼 수 있습니다.',
    },
  },
  {
    id: 39,
    arcana: 'minor',
    suit: 'cups',
    rank: 4,
    nameKo: '컵 4',
    nameEn: 'Four of Cups',
    upright: {
      keywords: ['권태', '숙고', '거리 두기'],
      summary:
        '눈앞의 제안이 시큰둥하게 느껴지고 마음이 안으로 향하는 때를 보여 줍니다. 무엇이 나를 지루하게 하는지 차분히 짚어 보는 시간입니다.',
    },
    reversed: {
      keywords: ['새 관심', '깨어남', '늦은 반응'],
      summary:
        '굳어 있던 시선이 풀리며 새로운 것에 눈이 가기 시작할 수 있습니다. 지나쳤던 제안을 다시 살피는 계기가 됩니다.',
    },
  },
  {
    id: 40,
    arcana: 'minor',
    suit: 'cups',
    rank: 5,
    nameKo: '컵 5',
    nameEn: 'Five of Cups',
    upright: {
      keywords: ['아쉬움', '슬픔', '회복의 여지'],
      summary:
        '잃은 것에 마음이 머무는 시기일 수 있습니다. 남아 있는 것도 함께 볼 수 있다는 점을 일깨우는 카드입니다. 슬픔을 충분히 인정하는 일이 회복의 첫걸음이 되기도 합니다.',
    },
    reversed: {
      keywords: ['수용', '회복', '앞으로 나아감'],
      summary:
        '상실감을 서서히 받아들이며 다음으로 시선을 옮기는 흐름입니다. 아직 남은 아쉬움은 천천히 정리해도 괜찮습니다.',
    },
  },
  {
    id: 41,
    arcana: 'minor',
    suit: 'cups',
    rank: 6,
    nameKo: '컵 6',
    nameEn: 'Six of Cups',
    upright: {
      keywords: ['추억', '순수함', '호의'],
      summary:
        '옛 기억이나 오래된 인연이 따뜻하게 떠오르는 때일 수 있습니다. 소박한 친절이 마음을 녹이는 힘을 지닙니다.',
    },
    reversed: {
      keywords: ['과거 집착', '미화', '성장 필요'],
      summary:
        '지나간 시절에만 머물러 현재의 변화를 놓치고 있지 않은지 묻는 카드입니다. 추억은 간직하되 지금의 자리에 시선을 두는 일이 중요합니다.',
    },
  },
  {
    id: 42,
    arcana: 'minor',
    suit: 'cups',
    rank: 7,
    nameKo: '컵 7',
    nameEn: 'Seven of Cups',
    upright: {
      keywords: ['선택지', '상상', '혼란'],
      summary:
        '여러 가능성이 눈앞에 펼쳐져 무엇을 고를지 어지러운 때입니다. 마음에 그린 그림과 현실을 구분해 볼 필요가 있습니다.',
    },
    reversed: {
      keywords: ['정리', '현실 감각', '결정'],
      summary:
        '흩어진 후보 가운데 실제로 가능한 것을 가려내는 흐름입니다. 다만 고르는 시간이 길어지면 오히려 피로가 쌓일 수 있습니다.',
    },
  },
  {
    id: 43,
    arcana: 'minor',
    suit: 'cups',
    rank: 8,
    nameKo: '컵 8',
    nameEn: 'Eight of Cups',
    upright: {
      keywords: ['떠남', '재탐색', '채워지지 않음'],
      summary:
        '겉으로는 갖췄으나 마음이 채워지지 않아 다른 길을 찾고 싶어지는 때일 수 있습니다. 익숙한 자리를 정리하는 용기가 필요한 순간입니다.',
    },
    reversed: {
      keywords: ['미련', '주저함', '방황'],
      summary:
        '떠나고 싶으나 발이 떨어지지 않거나 방향 없이 헤매는 느낌이 들 수 있습니다. 무엇을 찾고 싶은지 한 줄로 적으면 방향이 잡히기도 합니다.',
    },
  },
  {
    id: 44,
    arcana: 'minor',
    suit: 'cups',
    rank: 9,
    nameKo: '컵 9',
    nameEn: 'Nine of Cups',
    upright: {
      keywords: ['만족', '흡족함', '여유'],
      summary:
        '바라던 바가 어느 정도 채워져 스스로 흐뭇한 시기일 수 있습니다. 지금의 만족을 가볍게 즐겨도 좋은 때입니다.',
    },
    reversed: {
      keywords: ['과한 자족', '허영', '허전한 기쁨'],
      summary:
        '겉은 풍족해 보여도 속은 허전한 감각이 남을 수 있습니다. 진짜 바라는 것이 무엇인지 되짚어 보게 합니다.',
    },
  },
  {
    id: 45,
    arcana: 'minor',
    suit: 'cups',
    rank: 10,
    nameKo: '컵 10',
    nameEn: 'Ten of Cups',
    upright: {
      keywords: ['화목', '정서적 충만', '유대'],
      summary:
        '가까운 이들과의 관계 안에서 안정감을 느끼는 상태입니다. 마음이 통하는 일상의 소중함이 부각됩니다.',
    },
    reversed: {
      keywords: ['불화', '기대 차이', '이상과 현실'],
      summary:
        '그려 온 모습과 실제 관계 사이에 차이가 느껴질 수 있습니다. 서로 다른 바람을 터놓고 맞춰 가는 과정이 필요합니다.',
    },
  },
  {
    id: 46,
    arcana: 'minor',
    suit: 'cups',
    rank: 11,
    nameKo: '컵 페이지',
    nameEn: 'Page of Cups',
    upright: {
      keywords: ['감수성', '다정함', '소식'],
      summary:
        '감정에 솔직하고 순수한 마음을 지닌 성향입니다. 작은 호의나 반가운 소식이 마음을 가볍게 합니다.',
    },
    reversed: {
      keywords: ['예민함', '미성숙', '감정 기복'],
      summary:
        '작은 일에도 쉽게 상처받거나 감정이 널뛰는 면이 드러날 수 있습니다. 느낌을 정리한 뒤 표현하면 오해가 줄어듭니다.',
    },
  },
  {
    id: 47,
    arcana: 'minor',
    suit: 'cups',
    rank: 12,
    nameKo: '컵 나이트',
    nameEn: 'Knight of Cups',
    upright: {
      keywords: ['낭만', '제안', '이상'],
      summary:
        '이상과 감성을 품고 다가가는 낭만적인 태도를 보여 줍니다. 마음을 담은 표현이 상대에게 닿는 때일 수 있습니다.',
    },
    reversed: {
      keywords: ['비현실적 기대', '변덕', '말뿐인 약속'],
      summary:
        '기분에 따라 말과 행동이 달라져 신뢰를 흔들 수 있습니다. 열기가 식은 뒤에도 지킬 수 있는 약속인지 따져 볼 만합니다.',
    },
  },
  {
    id: 48,
    arcana: 'minor',
    suit: 'cups',
    rank: 13,
    nameKo: '컵 퀸',
    nameEn: 'Queen of Cups',
    upright: {
      keywords: ['공감', '직관', '포용력'],
      summary:
        '타인의 마음을 깊이 헤아리는 따뜻한 성향과 이어집니다. 감정을 안정적으로 다루며 곁을 지켜 주는 태도가 돋보입니다.',
    },
    reversed: {
      keywords: ['감정 과몰입', '경계 부족', '의존'],
      summary:
        '남의 감정에 지나치게 휩쓸려 정작 자신이 지칠 수 있습니다. 공감과 거리 사이에 선을 긋는 일이 필요합니다.',
    },
  },
  {
    id: 49,
    arcana: 'minor',
    suit: 'cups',
    rank: 14,
    nameKo: '컵 킹',
    nameEn: 'King of Cups',
    upright: {
      keywords: ['절제된 감정', '성숙', '균형'],
      summary:
        '감정을 누르지 않으면서도 차분하게 다룰 줄 아는 성숙한 태도입니다. 사람들 사이에서 침착한 중심이 되어 줍니다.',
    },
    reversed: {
      keywords: ['감정 억압', '냉담', '조종'],
      summary:
        '속마음을 감추다 보니 거리감이 생기거나 감정으로 상대를 움직이려는 면이 나타날 수 있습니다. 솔직한 표현이 서로의 부담을 덜어 줍니다.',
    },
  },
] as const satisfies readonly TarotCardType[];
