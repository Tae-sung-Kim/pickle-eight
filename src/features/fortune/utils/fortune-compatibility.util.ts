import {
  FORTUNE_COMPATIBILITY_ELEMENT_PAIR_RULES,
  FORTUNE_COMPATIBILITY_STAR_SIGN_ELEMENTS,
  FORTUNE_COMPATIBILITY_STAR_SIGN_GRADE_BY_RELATION,
} from '@/features/fortune/constants/fortune-compatibility-star-sign.constant';
import {
  FORTUNE_COMPATIBILITY_TTI_GRADE_BY_RELATION,
  FORTUNE_COMPATIBILITY_TTI_GROUP_RULES,
  FORTUNE_COMPATIBILITY_TTI_PAIR_RULES,
} from '@/features/fortune/constants/fortune-compatibility-tti.constant';
import { FORTUNE_STAR_SIGNS } from '@/features/fortune/constants/fortune-star-sign.constant';
import { FORTUNE_ZODIAC } from '@/features/fortune/constants/fortune-zodiac.constant';
import type {
  FortuneStarSignKeyType,
  FortuneTtiKeyType,
} from '@/features/fortune/types/fortune.type';
import type {
  FortuneCompatibilityCopyBundleType,
  FortuneCompatibilityElementKeyType,
  FortuneCompatibilityElementRelationKeyType,
  FortuneCompatibilityGradeKeyType,
  FortuneCompatibilityPairKeyType,
  FortuneCompatibilityStarSignPairKeyType,
  FortuneCompatibilityStarSignRelationCopyType,
  FortuneCompatibilityStarSignRelationKeyType,
  FortuneCompatibilityStarSignResultType,
  FortuneCompatibilityStarSignSameCopyType,
  FortuneCompatibilityTtiPairKeyType,
  FortuneCompatibilityTtiRelationCopyType,
  FortuneCompatibilityTtiRelationKeyType,
  FortuneCompatibilityTtiResultType,
  FortuneCompatibilityTtiSameCopyType,
} from '@/features/fortune/types/fortune-compatibility.type';

const TTI_ORDER: readonly FortuneTtiKeyType[] = FORTUNE_ZODIAC.map(
  (item) => item.key
);
const STAR_SIGN_ORDER: readonly FortuneStarSignKeyType[] =
  FORTUNE_STAR_SIGNS.map((item) => item.key);

/** 두 키를 목록 순서로 정렬한 "앞-뒤" 키. 입력 순서와 무관하다 */
function buildPairKey<K extends string>(
  a: K,
  b: K,
  order: readonly K[]
): FortuneCompatibilityPairKeyType<K> {
  return order.indexOf(a) <= order.indexOf(b) ? `${a}-${b}` : `${b}-${a}`;
}

/** 목록에서 만들 수 있는 모든 순서 없는 쌍(같은 키 포함). n*(n+1)/2개 */
function listAllPairKeys<K extends string>(
  order: readonly K[]
): FortuneCompatibilityPairKeyType<K>[] {
  return order.flatMap((a, i) =>
    order.slice(i).map((b) => buildPairKey(a, b, order))
  );
}

export function createFortuneCompatibilityTtiPairKey(
  a: FortuneTtiKeyType,
  b: FortuneTtiKeyType
): FortuneCompatibilityTtiPairKeyType {
  return buildPairKey(a, b, TTI_ORDER);
}

export function createFortuneCompatibilityStarSignPairKey(
  a: FortuneStarSignKeyType,
  b: FortuneStarSignKeyType
): FortuneCompatibilityStarSignPairKeyType {
  return buildPairKey(a, b, STAR_SIGN_ORDER);
}

/** 규칙 목록에서 계산한 띠 관계표. 우선순위가 높은 관계를 먼저 넣고 이미 있으면 건너뛴다 */
function buildTtiRelationTable(): ReadonlyMap<
  FortuneCompatibilityTtiPairKeyType,
  FortuneCompatibilityTtiRelationKeyType
> {
  const table = new Map<
    FortuneCompatibilityTtiPairKeyType,
    FortuneCompatibilityTtiRelationKeyType
  >();

  const put = (
    a: FortuneTtiKeyType,
    b: FortuneTtiKeyType,
    relation: FortuneCompatibilityTtiRelationKeyType
  ) => {
    const key = createFortuneCompatibilityTtiPairKey(a, b);
    if (!table.has(key)) {
      table.set(key, relation);
    }
  };

  for (const key of TTI_ORDER) {
    put(key, key, 'same');
  }
  for (const [a, b] of FORTUNE_COMPATIBILITY_TTI_PAIR_RULES.yukhap) {
    put(a, b, 'yukhap');
  }
  for (const [a, b, c] of FORTUNE_COMPATIBILITY_TTI_GROUP_RULES.samhap) {
    put(a, b, 'samhap');
    put(a, c, 'samhap');
    put(b, c, 'samhap');
  }
  for (const [a, b, c] of FORTUNE_COMPATIBILITY_TTI_GROUP_RULES.banghap) {
    put(a, b, 'banghap');
    put(a, c, 'banghap');
    put(b, c, 'banghap');
  }
  for (const [a, b] of FORTUNE_COMPATIBILITY_TTI_PAIR_RULES.chung) {
    put(a, b, 'chung');
  }
  for (const [a, b] of FORTUNE_COMPATIBILITY_TTI_PAIR_RULES.wonjin) {
    put(a, b, 'wonjin');
  }
  for (const key of listAllPairKeys(TTI_ORDER)) {
    if (!table.has(key)) {
      table.set(key, 'other');
    }
  }
  return table;
}

const TTI_RELATION_TABLE = buildTtiRelationTable();

/** 띠 78조합 키 목록(쥐-쥐부터) */
export function listFortuneCompatibilityTtiPairKeys(): FortuneCompatibilityTtiPairKeyType[] {
  return listAllPairKeys(TTI_ORDER);
}

/** 별자리 78조합 키 목록 */
export function listFortuneCompatibilityStarSignPairKeys(): FortuneCompatibilityStarSignPairKeyType[] {
  return listAllPairKeys(STAR_SIGN_ORDER);
}

export function resolveFortuneCompatibilityTtiRelation(
  a: FortuneTtiKeyType,
  b: FortuneTtiKeyType
): FortuneCompatibilityTtiRelationKeyType {
  return (
    TTI_RELATION_TABLE.get(createFortuneCompatibilityTtiPairKey(a, b)) ??
    'other'
  );
}

export function resolveFortuneCompatibilityTtiGrade(
  relation: FortuneCompatibilityTtiRelationKeyType
): FortuneCompatibilityGradeKeyType {
  return FORTUNE_COMPATIBILITY_TTI_GRADE_BY_RELATION[relation];
}

export function resolveFortuneCompatibilityTti(
  a: FortuneTtiKeyType,
  b: FortuneTtiKeyType
): FortuneCompatibilityTtiResultType {
  const relation = resolveFortuneCompatibilityTtiRelation(a, b);
  return {
    pairKey: createFortuneCompatibilityTtiPairKey(a, b),
    relation,
    grade: resolveFortuneCompatibilityTtiGrade(relation),
  };
}

/** 서로 다른 원소 조합의 관계(순서 무관) */
function resolveElementPairRelation(
  a: FortuneCompatibilityElementKeyType,
  b: FortuneCompatibilityElementKeyType
): FortuneCompatibilityElementRelationKeyType {
  if (a === b) {
    return 'sameElement';
  }
  for (const relation of ['complement', 'opposite', 'other'] as const) {
    const hit = FORTUNE_COMPATIBILITY_ELEMENT_PAIR_RULES[relation].some(
      ([x, y]) => (x === a && y === b) || (x === b && y === a)
    );
    if (hit) {
      return relation;
    }
  }
  return 'other';
}

/** 두 별자리의 원소 관계. 같은 별자리도 같은 원소다 */
export function resolveFortuneCompatibilityElementRelation(
  a: FortuneStarSignKeyType,
  b: FortuneStarSignKeyType
): FortuneCompatibilityElementRelationKeyType {
  return resolveElementPairRelation(
    FORTUNE_COMPATIBILITY_STAR_SIGN_ELEMENTS[a],
    FORTUNE_COMPATIBILITY_STAR_SIGN_ELEMENTS[b]
  );
}

/** 별자리 관계. 같은 별자리면 `same`, 아니면 원소 관계 */
export function resolveFortuneCompatibilityStarSignRelation(
  a: FortuneStarSignKeyType,
  b: FortuneStarSignKeyType
): FortuneCompatibilityStarSignRelationKeyType {
  return a === b ? 'same' : resolveFortuneCompatibilityElementRelation(a, b);
}

export function resolveFortuneCompatibilityStarSignGrade(
  relation: FortuneCompatibilityStarSignRelationKeyType
): FortuneCompatibilityGradeKeyType {
  return FORTUNE_COMPATIBILITY_STAR_SIGN_GRADE_BY_RELATION[relation];
}

export function resolveFortuneCompatibilityStarSign(
  a: FortuneStarSignKeyType,
  b: FortuneStarSignKeyType
): FortuneCompatibilityStarSignResultType {
  const relation = resolveFortuneCompatibilityStarSignRelation(a, b);
  return {
    pairKey: createFortuneCompatibilityStarSignPairKey(a, b),
    relation,
    grade: resolveFortuneCompatibilityStarSignGrade(relation),
  };
}

/** 띠 문구 연결. 같은 띠면 전용 묶음, 아니면 관계 유형 묶음 */
export function resolveFortuneCompatibilityTtiCopy(
  a: FortuneTtiKeyType,
  b: FortuneTtiKeyType,
  relationCopy: FortuneCompatibilityTtiRelationCopyType,
  sameCopy: FortuneCompatibilityTtiSameCopyType
): FortuneCompatibilityCopyBundleType {
  const relation = resolveFortuneCompatibilityTtiRelation(a, b);
  return relation === 'same' ? sameCopy[a] : relationCopy[relation];
}

/** 별자리 문구 연결. 같은 별자리면 전용 묶음, 아니면 원소 관계 유형 묶음 */
export function resolveFortuneCompatibilityStarSignCopy(
  a: FortuneStarSignKeyType,
  b: FortuneStarSignKeyType,
  relationCopy: FortuneCompatibilityStarSignRelationCopyType,
  sameCopy: FortuneCompatibilityStarSignSameCopyType
): FortuneCompatibilityCopyBundleType {
  const relation = resolveFortuneCompatibilityStarSignRelation(a, b);
  return relation === 'same' ? sameCopy[a] : relationCopy[relation];
}
