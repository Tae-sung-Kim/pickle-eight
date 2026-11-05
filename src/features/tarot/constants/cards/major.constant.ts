import type { TarotCardType } from '@/features/tarot/types/tarot.type';

/** 메이저 22장 (id 0~21, rank 0~21) */
export const TAROT_MAJOR_CARDS = [
  {
    id: 0,
    arcana: 'major',
    suit: null,
    rank: 0,
    nameKo: '바보',
    nameEn: 'The Fool',
    upright: {
      keywords: ['새 출발', '순수함', '가능성'],
      summary:
        '아직 정해지지 않은 길 앞에서 가벼운 마음으로 첫발을 떼는 시기일 수 있습니다. 계획이 완벽하지 않아도 호기심이 방향을 열어 줄 가능성이 있습니다.',
    },
    reversed: {
      keywords: ['성급함', '무모함', '준비 부족'],
      summary:
        '의욕이 앞서 확인할 것을 놓치고 있지 않은지 돌아보게 합니다. 속도를 한 박자 늦추고 기본 준비를 점검해 보는 것도 방법입니다.',
    },
  },
  {
    id: 1,
    arcana: 'major',
    suit: null,
    rank: 1,
    nameKo: '마법사',
    nameEn: 'The Magician',
    upright: {
      keywords: ['실행력', '집중', '주도성'],
      summary:
        '가진 재능과 자원을 한곳에 모아 직접 움직이기 좋은 때로 보입니다. 생각에만 머물던 일을 구체적인 행동으로 옮기는 흐름을 보여 줍니다.',
    },
    reversed: {
      keywords: ['분산', '과시', '불발'],
      summary:
        '할 수 있는 일이 많다 보니 힘이 여러 갈래로 흩어지는 느낌이 들 수 있습니다. 한두 가지에 집중하고 말보다 결과를 차분히 쌓아 가는 편이 도움이 될 수 있습니다.',
    },
  },
  {
    id: 2,
    arcana: 'major',
    suit: null,
    rank: 2,
    nameKo: '여사제',
    nameEn: 'The High Priestess',
    upright: {
      keywords: ['직관', '고요', '숨은 의미'],
      summary:
        '겉으로 드러난 정보보다 마음속 감각에 귀를 기울여 보라는 카드로 읽을 수 있습니다. 서둘러 답을 내리기보다 조용히 상황을 관찰하는 시간이 어울립니다.',
    },
    reversed: {
      keywords: ['소음', '의심', '닫힌 마음'],
      summary:
        '주변의 말과 정보가 너무 많아 스스로의 감각이 묻히고 있는지 살펴보게 합니다. 속마음을 외면해 온 부분이 있다면 잠시 멈추고 정리해 볼 만합니다.',
    },
  },
  {
    id: 3,
    arcana: 'major',
    suit: null,
    rank: 3,
    nameKo: '여황제',
    nameEn: 'The Empress',
    upright: {
      keywords: ['풍요', '돌봄', '창조'],
      summary:
        '주변을 보살피고 키워 가는 힘이 자연스럽게 드러나는 모습을 떠올리게 합니다. 여유와 즐거움 속에서 결실의 바탕이 다져지는 흐름과 닿아 있습니다.',
    },
    reversed: {
      keywords: ['과보호', '의존', '소진'],
      summary:
        '챙기는 마음이 지나쳐 자신이나 상대가 지쳐 가고 있을 수 있습니다. 베푸는 만큼 스스로를 돌보는 균형이 필요한 때입니다.',
    },
  },
  {
    id: 4,
    arcana: 'major',
    suit: null,
    rank: 4,
    nameKo: '황제',
    nameEn: 'The Emperor',
    upright: {
      keywords: ['질서', '책임', '안정'],
      summary:
        '체계와 규칙을 세워 상황을 안정적으로 이끌어 가는 모습과 가까운 카드입니다. 계획한 일을 끝까지 책임지는 태도가 든든한 바탕이 될 수 있습니다.',
    },
    reversed: {
      keywords: ['고집', '통제', '경직'],
      summary:
        '원칙을 지키려는 마음이 어느새 융통성 없는 통제로 굳어지는 듯 보입니다. 한 걸음 물러서서 다른 의견을 들어 보는 일이 흐름을 푸는 계기가 될 수 있습니다.',
    },
  },
  {
    id: 5,
    arcana: 'major',
    suit: null,
    rank: 5,
    nameKo: '교황',
    nameEn: 'The Hierophant',
    upright: {
      keywords: ['전통', '배움', '조언'],
      summary:
        '검증된 방식과 경험 많은 사람의 조언에서 안정감을 얻는 시기일 수 있습니다. 배움의 자리나 오래된 약속, 공동체의 규범이 중요하게 다가옵니다.',
    },
    reversed: {
      keywords: ['틀 벗어나기', '의문', '나만의 방식'],
      summary:
        '정해진 틀이 맞지 않는다고 느껴 나만의 방식을 찾으려는 마음이 커질 수 있습니다. 기본을 모두 내려놓기 전에 쓸 만한 것을 가려 보는 편이 나을 수 있습니다.',
    },
  },
  {
    id: 6,
    arcana: 'major',
    suit: null,
    rank: 6,
    nameKo: '연인',
    nameEn: 'The Lovers',
    upright: {
      keywords: ['선택', '조화', '가치관'],
      summary:
        '두 갈래 사이에서 마음이 정말 원하는 쪽을 고르는 일과 이어진 카드입니다. 관계에서는 서로의 가치가 어우러지는 지점을 확인해 볼 만한 때입니다.',
    },
    reversed: {
      keywords: ['불균형', '망설임', '어긋남'],
      summary:
        '선택을 미루거나 서로의 기대가 엇갈려 마음이 흔들리는 때일 수 있습니다. 무엇을 중요하게 여기는지 솔직하게 정리해 보는 일부터 시작할 수 있습니다.',
    },
  },
  {
    id: 7,
    arcana: 'major',
    suit: null,
    rank: 7,
    nameKo: '전차',
    nameEn: 'The Chariot',
    upright: {
      keywords: ['추진력', '의지', '균형 잡기'],
      summary:
        '분명한 목표를 향해 의지를 모아 앞으로 나아가는 흐름을 보여 줍니다. 서로 다른 마음과 힘을 한 방향으로 맞추는 일이 열쇠일 수 있습니다.',
    },
    reversed: {
      keywords: ['방향 상실', '충돌', '과속'],
      summary:
        '힘은 있는데 방향이 정해지지 않아 제자리를 맴도는 느낌이 들 수 있습니다. 속도를 줄이고 목적지를 다시 확인해 보는 것도 방법입니다.',
    },
  },
  {
    id: 8,
    arcana: 'major',
    suit: null,
    rank: 8,
    nameKo: '힘',
    nameEn: 'Strength',
    upright: {
      keywords: ['인내', '용기', '자기 조절'],
      summary:
        '강하게 밀어붙이기보다 인내와 따뜻함으로 상황을 다루는 힘을 떠올리게 합니다. 내면의 충동을 차분히 다독이는 데서 용기가 나올 수 있습니다.',
    },
    reversed: {
      keywords: ['자신감 저하', '충동', '피로'],
      summary:
        '스스로를 믿기 어려워 마음이 쉽게 흔들리는 시기일 수 있습니다. 작은 성취부터 다시 쌓아 에너지를 회복하는 쪽을 살펴볼 만합니다.',
    },
  },
  {
    id: 9,
    arcana: 'major',
    suit: null,
    rank: 9,
    nameKo: '은둔자',
    nameEn: 'The Hermit',
    upright: {
      keywords: ['성찰', '탐구', '거리 두기'],
      summary:
        '잠시 바깥의 소란에서 물러나 자신만의 기준을 찾아가는 때로 읽을 수 있습니다. 혼자 있는 시간이 앞으로의 방향을 정리하는 데 쓰일 수 있습니다.',
    },
    reversed: {
      keywords: ['고립', '외면', '단절'],
      summary:
        '혼자만의 시간이 길어져 사람들과의 거리가 지나치게 멀어지고 있지는 않은지 돌아볼 때입니다. 믿을 만한 사람과 생각을 나누어 보는 것도 방법입니다.',
    },
  },
  {
    id: 10,
    arcana: 'major',
    suit: null,
    rank: 10,
    nameKo: '운명의 수레바퀴',
    nameEn: 'Wheel of Fortune',
    upright: {
      keywords: ['변화의 흐름', '주기', '전환점'],
      summary:
        '좋은 때와 어려운 때가 번갈아 오는 삶의 주기를 떠올리게 하는 카드입니다. 흐름이 바뀌는 지점에 서 있을 수 있으며, 변화에 맞춰 유연하게 움직이는 편이 어울립니다.',
    },
    reversed: {
      keywords: ['지연', '반복', '어긋난 타이밍'],
      summary:
        '기대한 변화가 더디거나 같은 패턴이 되풀이되는 듯 느껴질 수 있습니다. 바깥 상황보다 내가 바꿀 수 있는 습관과 선택에 눈을 돌려 보라는 메시지로 읽힙니다.',
    },
  },
  {
    id: 11,
    arcana: 'major',
    suit: null,
    rank: 11,
    nameKo: '정의',
    nameEn: 'Justice',
    upright: {
      keywords: ['공정', '균형', '판단'],
      summary:
        '사실을 차분히 따져 보고 균형 있는 결정을 내리려는 태도와 이어집니다. 선택에는 책임이 따른다는 점을 짚어 주는 카드이기도 합니다.',
    },
    reversed: {
      keywords: ['편향', '불균형', '회피'],
      summary:
        '한쪽에 치우친 시각이나 부족한 정보가 판단을 흐리고 있을 수 있습니다. 피하고 있는 책임은 없는지 솔직하게 살펴보게 합니다.',
    },
  },
  {
    id: 12,
    arcana: 'major',
    suit: null,
    rank: 12,
    nameKo: '매달린 사람',
    nameEn: 'The Hanged Man',
    upright: {
      keywords: ['멈춤', '관점 전환', '내려놓음'],
      summary:
        '나아가기보다 잠시 멈추고 다른 각도에서 바라보는 시기일 수 있습니다. 기다림이 새로운 이해로 이어지는 경우도 있습니다.',
    },
    reversed: {
      keywords: ['정체', '미련', '소극적 기다림'],
      summary:
        '기다림이 길어지며 결정을 미루는 핑계가 되고 있지는 않은지 점검해 볼 만합니다. 놓을 것과 붙잡을 것을 구분하면 움직일 실마리가 보일 수 있습니다.',
    },
  },
  {
    id: 13,
    arcana: 'major',
    suit: null,
    rank: 13,
    nameKo: '죽음',
    nameEn: 'Death',
    upright: {
      keywords: ['끝맺음', '전환', '정리'],
      summary:
        '한 시기가 마무리되고 새로운 국면으로 넘어가는 신호로 읽을 수 있습니다. 놓아주는 일이 낯설고 아쉽더라도 다음을 위한 자리를 만드는 과정일 수 있습니다.',
    },
    reversed: {
      keywords: ['미련', '지연', '변화 거부'],
      summary:
        '끝내야 할 것을 붙잡고 있어 전환이 늦어지고 있을 수 있습니다. 변화가 두렵게 느껴지는 마음을 먼저 인정하는 데서 시작해 보는 것도 방법입니다.',
    },
    note: '죽음 카드는 실제 죽음이 아니라 끝맺음과 전환을 의미하는 경우가 많습니다.',
  },
  {
    id: 14,
    arcana: 'major',
    suit: null,
    rank: 14,
    nameKo: '절제',
    nameEn: 'Temperance',
    upright: {
      keywords: ['조화', '적절함', '조율'],
      summary:
        '서로 다른 요소를 알맞게 섞어 무리 없는 속도로 나아가는 태도를 보여 줍니다. 급하지 않게 균형을 맞추는 일이 지금의 과제일 수 있습니다.',
    },
    reversed: {
      keywords: ['과도함', '불균형', '조급'],
      summary:
        '한쪽으로 치우친 생활이나 감정의 기복이 커져 리듬이 흐트러질 수 있습니다. 줄일 것과 채울 것을 나누어 점검하는 일이 출발점이 될 수 있습니다.',
    },
  },
  {
    id: 15,
    arcana: 'major',
    suit: null,
    rank: 15,
    nameKo: '악마',
    nameEn: 'The Devil',
    upright: {
      keywords: ['집착', '습관', '얽매임'],
      summary:
        '익숙해진 습관이나 관계, 욕구에 마음이 묶여 있지 않은지 돌아볼 신호로 읽을 수 있습니다. 두려움 없이 바라보면 스스로 선택할 수 있는 부분이 보일 수 있습니다.',
    },
    reversed: {
      keywords: ['자각', '거리 두기', '망설임'],
      summary:
        '얽매임을 알아차리고 거리를 두려는 움직임이 시작되는 시기일 수 있습니다. 한 번에 끊어 내기보다 작은 부분부터 바꿔 보는 쪽이 현실적입니다.',
    },
  },
  {
    id: 16,
    arcana: 'major',
    suit: null,
    rank: 16,
    nameKo: '탑',
    nameEn: 'The Tower',
    upright: {
      keywords: ['급변', '균열', '재정비'],
      summary:
        '예상하지 못한 변화로 기존의 틀이 흔들릴 수 있다는 신호입니다. 불안정했던 부분이 드러나는 계기이자, 새로 세울 기회로 볼 수 있습니다.',
    },
    reversed: {
      keywords: ['불안', '회피', '미뤄진 변화'],
      summary:
        '다가오는 변화를 알면서도 외면하고 있거나, 큰 충격은 피했지만 불안이 남아 있을 수 있습니다. 작은 균열을 미리 살펴 고쳐 두면 마음이 한결 가벼워질 수 있습니다.',
    },
  },
  {
    id: 17,
    arcana: 'major',
    suit: null,
    rank: 17,
    nameKo: '별',
    nameEn: 'The Star',
    upright: {
      keywords: ['희망', '회복', '영감'],
      summary:
        '지친 마음이 서서히 풀리며 앞날에 대한 믿음이 다시 살아나는 시기일 수 있습니다. 서두르지 않고 꾸준히 나아가는 모습에 희망이 실려 있습니다.',
    },
    reversed: {
      keywords: ['낙담', '의욕 저하', '불신'],
      summary:
        '기대가 꺾여 앞날이 흐리게 느껴지는 때일 수 있습니다. 큰 결심보다 쉬어 가며 작은 즐거움을 되찾는 데서 출발해 보는 것도 좋습니다.',
    },
  },
  {
    id: 18,
    arcana: 'major',
    suit: null,
    rank: 18,
    nameKo: '달',
    nameEn: 'The Moon',
    upright: {
      keywords: ['불확실', '직감', '모호함'],
      summary:
        '상황이 선명하지 않아 불안과 상상이 커지기 쉬운 시기일 수 있습니다. 확인되지 않은 추측에 휘둘리기보다 드러나는 사실을 천천히 지켜보게 합니다.',
    },
    reversed: {
      keywords: ['정리', '직면', '눌린 감정'],
      summary:
        '모호했던 부분이 조금씩 정리되며 마음이 가라앉는 흐름으로 보입니다. 다만 눌러 둔 감정이 남아 있다면 차분히 들여다보는 시간이 필요합니다.',
    },
  },
  {
    id: 19,
    arcana: 'major',
    suit: null,
    rank: 19,
    nameKo: '태양',
    nameEn: 'The Sun',
    upright: {
      keywords: ['활력', '기쁨', '명료함'],
      summary:
        '분위기가 밝아지고 자신감과 활기가 자연스럽게 살아나는 시기일 수 있습니다. 숨김없이 드러내고 나누는 데서 즐거움이 커지는 모습을 보여 줍니다.',
    },
    reversed: {
      keywords: ['과신', '지연', '줄어든 기쁨'],
      summary:
        '기대만큼 즐거움이 느껴지지 않거나 낙관이 지나쳐 세부를 놓치기 쉬운 때입니다. 기쁨이 잠시 가려진 듯하더라도 일상의 작은 즐거움부터 챙겨 볼 만합니다.',
    },
  },
  {
    id: 20,
    arcana: 'major',
    suit: null,
    rank: 20,
    nameKo: '심판',
    nameEn: 'Judgement',
    upright: {
      keywords: ['부름', '재평가', '결단'],
      summary:
        '지난 시간을 정리하고 새 출발을 결심하는 때일 수 있습니다. 과거의 경험을 있는 그대로 인정할 때 앞으로의 방향이 또렷해질 수 있습니다.',
    },
    reversed: {
      keywords: ['자책', '망설임', '미해결'],
      summary:
        '지난 일을 스스로 용서하지 못해 결정을 미루고 있을 수 있습니다. 완벽한 정리를 기다리기보다 배운 점만 챙겨 가볍게 출발하는 쪽이 부담이 덜할 수 있습니다.',
    },
  },
  {
    id: 21,
    arcana: 'major',
    suit: null,
    rank: 21,
    nameKo: '세계',
    nameEn: 'The World',
    upright: {
      keywords: ['완성', '통합', '마무리'],
      summary:
        '한 과정이 무르익어 결실을 확인하는 단계로 읽을 수 있습니다. 지금까지의 경험이 하나로 이어지며 다음 여정을 준비할 여유가 생길 수 있습니다.',
    },
    reversed: {
      keywords: ['미완', '지연', '마무리 부족'],
      summary:
        '거의 다 왔지만 마지막 한 조각이 채워지지 않아 아쉬움이 남을 수 있습니다. 놓친 부분이 무엇인지 점검하며 끝맺음에 시간을 들일 필요가 있습니다.',
    },
  },
] as const satisfies readonly TarotCardType[];
