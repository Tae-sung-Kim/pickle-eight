import type { TarotCardType } from '@/features/tarot/types/tarot.type';

/** 소드 14장 (id 50~63, rank 1~14) */
export const TAROT_SWORDS_CARDS = [
  {
    id: 50,
    arcana: 'minor',
    suit: 'swords',
    rank: 1,
    nameKo: '소드 에이스',
    nameEn: 'Ace of Swords',
    upright: {
      keywords: ['명료함', '통찰', '결단'],
      summary:
        '복잡하던 생각이 한 줄로 정리되며 핵심이 보이는 순간입니다. 새로운 아이디어나 분명한 판단이 떠오를 수 있습니다.',
    },
    reversed: {
      keywords: ['혼란', '거친 표현', '흐린 판단'],
      summary:
        '생각이 정리되지 않은 채 말이 앞서 오해를 낳을 수 있습니다. 결론을 서두르기 전에 사실부터 모아 볼 만합니다.',
    },
  },
  {
    id: 51,
    arcana: 'minor',
    suit: 'swords',
    rank: 2,
    nameKo: '소드 2',
    nameEn: 'Two of Swords',
    upright: {
      keywords: ['보류', '균형', '거리 두기'],
      summary:
        '양쪽 사이에서 판단을 잠시 멈춰 둔 상태를 나타냅니다. 마음의 소리를 듣기 위한 휴지기이기도 하나 오래 미루면 부담이 커집니다.',
    },
    reversed: {
      keywords: ['결정 압박', '정보 과다', '갈림길'],
      summary:
        '멈춰 있던 판단을 더는 미루기 어려워지는 때일 수 있습니다. 필요한 정보만 추려 작은 결론부터 내리는 방식이 부담을 덜어 줍니다.',
    },
  },
  {
    id: 52,
    arcana: 'minor',
    suit: 'swords',
    rank: 3,
    nameKo: '소드 3',
    nameEn: 'Three of Swords',
    upright: {
      keywords: ['아픈 마음', '돌아봄', '정리'],
      summary:
        '마음이 쓰라린 일을 마주하는 시기일 수 있으나 아픔을 있는 그대로 바라볼 때 정리의 계기가 되기도 합니다. 회복으로 가는 과정의 한 부분으로 읽을 수 있습니다.',
    },
    reversed: {
      keywords: ['회복', '놓아주기', '앙금'],
      summary:
        '아픔이 서서히 아물어 가지만 가라앉은 앙금이 남아 있을 수 있습니다. 이야기를 꺼내 놓는 일이 마음을 가볍게 합니다.',
    },
  },
  {
    id: 53,
    arcana: 'minor',
    suit: 'swords',
    rank: 4,
    nameKo: '소드 4',
    nameEn: 'Four of Swords',
    upright: {
      keywords: ['휴식', '재충전', '고요'],
      summary:
        '바쁘게 돌던 생각을 멈추고 쉬어 가는 시기를 나타냅니다. 지친 머리를 비우는 시간이 다음 걸음의 바탕이 됩니다.',
    },
    reversed: {
      keywords: ['불안한 쉼', '복귀', '쉬지 못함'],
      summary:
        '쉬어야 하는데 머릿속이 계속 시끄러워 편치 않을 수 있습니다. 조금씩 일상 리듬을 되찾는 연습이 필요한 때입니다.',
    },
  },
  {
    id: 54,
    arcana: 'minor',
    suit: 'swords',
    rank: 5,
    nameKo: '소드 5',
    nameEn: 'Five of Swords',
    upright: {
      keywords: ['이해 충돌', '신경전', '교훈'],
      summary:
        '이기려는 마음이 앞서 분위기가 거칠어질 수 있는 때입니다. 무엇을 얻고 무엇을 잃는지 되짚어 보면 쓸 만한 교훈이 보입니다.',
    },
    reversed: {
      keywords: ['화해', '후회', '여파'],
      summary:
        '다툼이 끝난 뒤에 남은 어색함과 후회를 어떻게 다룰지 묻는 카드입니다. 먼저 풀어 보려는 마음이 정리를 앞당길 수 있습니다.',
    },
  },
  {
    id: 55,
    arcana: 'minor',
    suit: 'swords',
    rank: 6,
    nameKo: '소드 6',
    nameEn: 'Six of Swords',
    upright: {
      keywords: ['이동', '전환', '안도'],
      summary:
        '힘든 구간을 벗어나 조용한 곳으로 옮겨 가는 흐름입니다. 완전히 가벼워지진 않아도 점차 숨을 돌릴 수 있습니다.',
    },
    reversed: {
      keywords: ['머뭇거림', '미련', '더딘 이동'],
      summary:
        '떠나려 하나 짐이 따라붙어 속도가 나지 않는 느낌일 수 있습니다. 가져갈 것과 두고 갈 것을 나누면 걸음이 가벼워집니다.',
    },
  },
  {
    id: 56,
    arcana: 'minor',
    suit: 'swords',
    rank: 7,
    nameKo: '소드 7',
    nameEn: 'Seven of Swords',
    upright: {
      keywords: ['전략', '조심스러움', '우회'],
      summary:
        '정면보다 눈에 띄지 않는 방법을 택하고 싶어지는 때일 수 있습니다. 숨기는 일이 부담으로 돌아오지 않는지 스스로 살필 필요가 있습니다.',
    },
    reversed: {
      keywords: ['드러남', '양심', '솔직해짐'],
      summary:
        '감춰 두었던 일을 털어놓고 싶은 마음이 커질 수 있습니다. 솔직하게 정리하는 편이 오히려 마음의 짐을 덜어 줍니다.',
    },
  },
  {
    id: 57,
    arcana: 'minor',
    suit: 'swords',
    rank: 8,
    nameKo: '소드 8',
    nameEn: 'Eight of Swords',
    upright: {
      keywords: ['제약', '막막함', '생각의 벽'],
      summary:
        '스스로 만든 생각의 틀에 갇힌 듯한 답답함을 나타냅니다. 실제로는 선택지가 있는데도 보이지 않는 경우가 많습니다.',
    },
    reversed: {
      keywords: ['풀림', '자각', '첫걸음'],
      summary:
        '굳어 있던 생각이 풀리며 빠져나갈 길이 눈에 들어옵니다. 아직 낯설어도 작은 움직임이 변화의 시작이 됩니다.',
    },
  },
  {
    id: 58,
    arcana: 'minor',
    suit: 'swords',
    rank: 9,
    nameKo: '소드 9',
    nameEn: 'Nine of Swords',
    upright: {
      keywords: ['걱정', '불면', '마음의 부담'],
      summary:
        '생각이 꼬리를 물어 밤새 걱정이 커지는 때일 수 있습니다. 그중 상당수는 실제보다 부풀려져 있기도 하니 누군가와 나누어 보는 것이 도움이 됩니다.',
    },
    reversed: {
      keywords: ['걱정 완화', '털어놓음', '회복의 신호'],
      summary:
        '마음을 누르던 불안이 조금씩 가라앉는 흐름일 수 있습니다. 힘든 부분은 믿을 만한 사람에게 기대어도 괜찮습니다.',
    },
  },
  {
    id: 59,
    arcana: 'minor',
    suit: 'swords',
    rank: 10,
    nameKo: '소드 10',
    nameEn: 'Ten of Swords',
    upright: {
      keywords: ['한 단계의 끝', '바닥 다지기', '전환'],
      summary:
        '힘겨웠던 국면이 마무리 지점에 닿았음을 알리는 카드입니다. 더 내려갈 곳이 없다는 것은 다시 일어설 자리가 마련되었다는 뜻으로도 읽을 수 있습니다.',
    },
    reversed: {
      keywords: ['회복 시작', '곱씹기', '끝맺기 어려움'],
      summary:
        '가장 힘든 시기를 지나 서서히 올라서는 단계일 수 있습니다. 끝난 일을 되풀이해 곱씹는 습관은 정리를 늦출 수 있습니다.',
    },
  },
  {
    id: 60,
    arcana: 'minor',
    suit: 'swords',
    rank: 11,
    nameKo: '소드 페이지',
    nameEn: 'Page of Swords',
    upright: {
      keywords: ['호기심', '질문', '경계'],
      summary:
        '새로운 정보에 눈을 반짝이며 묻고 따지기 좋아하는 성향입니다. 날카로운 관찰력이 장점이지만 말이 앞서지 않는 균형이 필요합니다.',
    },
    reversed: {
      keywords: ['말실수', '소문', '성급한 판단'],
      summary:
        '확인하지 않은 이야기를 옮기거나 말을 가볍게 던져 오해를 부를 수 있습니다. 입을 열기 전에 한 번 더 살피는 습관이 도움이 됩니다.',
    },
  },
  {
    id: 61,
    arcana: 'minor',
    suit: 'swords',
    rank: 12,
    nameKo: '소드 나이트',
    nameEn: 'Knight of Swords',
    upright: {
      keywords: ['직설', '신속함', '논리'],
      summary:
        '생각을 곧바로 행동과 말로 옮기는 빠르게 추진하는 성향입니다. 막힘없는 전개가 강점이지만 상대의 속도도 헤아릴 필요가 있습니다.',
    },
    reversed: {
      keywords: ['공격적 태도', '경솔함', '독선'],
      summary:
        '논리를 앞세워 상대를 몰아붙이는 모습으로 나타날 수 있습니다. 이기는 대화보다 통하는 대화를 떠올려 볼 만합니다.',
    },
  },
  {
    id: 62,
    arcana: 'minor',
    suit: 'swords',
    rank: 13,
    nameKo: '소드 퀸',
    nameEn: 'Queen of Swords',
    upright: {
      keywords: ['명확한 소통', '객관성', '독립심'],
      summary:
        '감정에 휘둘리지 않고 사실을 분명히 가려 말하는 성향입니다. 솔직한 태도가 신뢰를 줍니다.',
    },
    reversed: {
      keywords: ['냉정함', '날 선 말', '벽 쌓기'],
      summary:
        '경험에서 온 경계심이 차가운 태도로 비칠 수 있습니다. 마음의 문을 조금만 열어도 소통이 부드러워집니다.',
    },
  },
  {
    id: 63,
    arcana: 'minor',
    suit: 'swords',
    rank: 14,
    nameKo: '소드 킹',
    nameEn: 'King of Swords',
    upright: {
      keywords: ['판단력', '원칙', '공정한 시선'],
      summary:
        '논리와 원칙에 기대어 상황을 정리하는 성향입니다. 깊이 있는 판단으로 신뢰를 얻습니다.',
    },
    reversed: {
      keywords: ['융통성 부족', '권위적 태도', '냉혹한 판단'],
      summary:
        '기준이 지나치게 엄격하면 주변이 위축될 수 있습니다. 규칙의 취지를 다시 떠올리는 일이 필요합니다.',
    },
  },
] as const satisfies readonly TarotCardType[];
