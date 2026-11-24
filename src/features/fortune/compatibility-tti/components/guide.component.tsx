import type { JSX } from 'react';
import { FORTUNE_COMPATIBILITY_GRADES } from '@/features/fortune/constants/fortune-compatibility-grade.constant';
import {
  FORTUNE_COMPATIBILITY_GRADE_RULE_HEADING,
  FORTUNE_COMPATIBILITY_TABLE_CAPTIONS,
  FORTUNE_COMPATIBILITY_TTI_GRADE_RULE_PARAGRAPHS,
  FORTUNE_COMPATIBILITY_TTI_GUIDE,
  FORTUNE_COMPATIBILITY_TTI_RELATION_GUIDE,
} from '@/features/fortune/constants/fortune-compatibility-guide.constant';
import { FORTUNE_COMPATIBILITY_TTI_INTRO } from '@/features/fortune/constants/fortune-compatibility-intro.constant';
import {
  FORTUNE_COMPATIBILITY_TTI_GRADE_BY_RELATION,
  FORTUNE_COMPATIBILITY_TTI_GROUP_RULES,
  FORTUNE_COMPATIBILITY_TTI_PAIR_RULES,
  FORTUNE_COMPATIBILITY_TTI_RELATION_NAMES,
  FORTUNE_COMPATIBILITY_TTI_RELATION_PRIORITY,
} from '@/features/fortune/constants/fortune-compatibility-tti.constant';
import { FORTUNE_ZODIAC } from '@/features/fortune/constants/fortune-zodiac.constant';
import type { FortuneTtiKeyType } from '@/features/fortune/types/fortune.type';
import type { FortuneCompatibilityTtiRuleRelationKeyType } from '@/features/fortune/types/fortune-compatibility.type';

// 표 머리글. 문구 상수에 없어 여기에 둔다(ui-ux-design.md "등급 규칙 표(등급 | 관계)")
const GRADE_TABLE_HEADERS = { grade: '등급', relation: '관계' } as const;

/** 관계 설명 순서(ui-ux-design.md: 육합, 삼합, 방합, 충, 원진, 그 밖의 관계) */
const RELATION_ORDER = [
  'yukhap',
  'samhap',
  'banghap',
  'chung',
  'wonjin',
  'other',
] as const;

const H2_CLASS =
  'text-xl leading-tight font-semibold break-keep text-foreground sm:text-2xl';
const PARAGRAPH_CLASS =
  'max-w-[68ch] text-sm leading-7 text-foreground sm:text-base';

/** "쥐띠" → "쥐" */
const TTI_SHORT_NAME_BY_KEY = Object.fromEntries(
  FORTUNE_ZODIAC.map((zodiac) => [zodiac.key, zodiac.name.replace(/띠$/, '')])
) as Readonly<Record<FortuneTtiKeyType, string>>;

/** 관계별 조합. 규칙 상수에서 만든다("쥐-소", 삼합·방합은 "쥐-용-원숭이"). 그 밖의 관계는 없다 */
function listCombos(
  relation: FortuneCompatibilityTtiRuleRelationKeyType | 'other'
): string[] {
  let combos: readonly (readonly FortuneTtiKeyType[])[] = [];
  if (relation === 'samhap' || relation === 'banghap') {
    combos = FORTUNE_COMPATIBILITY_TTI_GROUP_RULES[relation];
  } else if (relation !== 'other') {
    combos = FORTUNE_COMPATIBILITY_TTI_PAIR_RULES[relation];
  }
  return combos.map((combo) =>
    combo.map((key) => TTI_SHORT_NAME_BY_KEY[key]).join('-')
  );
}

const GRADE_ROWS = FORTUNE_COMPATIBILITY_GRADES.map((grade) => ({
  key: grade.key,
  name: grade.name,
  relations: FORTUNE_COMPATIBILITY_TTI_RELATION_PRIORITY.filter(
    (relation) =>
      FORTUNE_COMPATIBILITY_TTI_GRADE_BY_RELATION[relation] === grade.key
  )
    .map((relation) => FORTUNE_COMPATIBILITY_TTI_RELATION_NAMES[relation])
    .join(', '),
}));

/**
 * FortuneCompatibilityTtiGuideComponent
 * - 띠 궁합 소개, 관계 정의와 관계 6개(h3 + 설명 + 조합 글), 등급 규칙(2열 표). 서버 컴포넌트.
 * - 조합 목록은 표가 아니라 글로 쓴다(320px 가로 스크롤 방지). 개인 결과·같은 띠 전용 문구는 넣지 않는다.
 */
export function FortuneCompatibilityTtiGuideComponent(): JSX.Element {
  return (
    <section className="space-y-6">
      {[
        ...FORTUNE_COMPATIBILITY_TTI_INTRO,
        ...FORTUNE_COMPATIBILITY_TTI_GUIDE,
      ].map((section) => (
        <div key={section.heading} className="space-y-2">
          <h2 className={H2_CLASS}>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className={PARAGRAPH_CLASS}>
              {paragraph}
            </p>
          ))}
        </div>
      ))}

      <div className="space-y-4">
        {RELATION_ORDER.map((relation) => {
          const guide = FORTUNE_COMPATIBILITY_TTI_RELATION_GUIDE[relation];
          const combos = listCombos(relation);
          return (
            <div key={relation} className="space-y-1">
              <h3 className="text-lg leading-snug font-semibold break-keep text-foreground">
                {guide.heading}
              </h3>
              <p className={PARAGRAPH_CLASS}>{guide.paragraph}</p>
              {combos.length > 0 ? (
                <p className="max-w-[68ch] text-sm leading-7 text-muted-foreground">
                  {combos.map((combo, index) => (
                    <span key={combo}>
                      <span className="whitespace-nowrap">{combo}</span>
                      {index < combos.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <h2 className={H2_CLASS}>{FORTUNE_COMPATIBILITY_GRADE_RULE_HEADING}</h2>
        {FORTUNE_COMPATIBILITY_TTI_GRADE_RULE_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph} className={PARAGRAPH_CLASS}>
            {paragraph}
          </p>
        ))}
        <table className="w-full max-w-[68ch] border-collapse text-left text-sm leading-6 text-foreground">
          <caption className="sr-only">
            {FORTUNE_COMPATIBILITY_TABLE_CAPTIONS.tti}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="px-2 py-2 font-semibold">
                {GRADE_TABLE_HEADERS.grade}
              </th>
              <th scope="col" className="px-2 py-2 font-semibold">
                {GRADE_TABLE_HEADERS.relation}
              </th>
            </tr>
          </thead>
          <tbody>
            {GRADE_ROWS.map((row) => (
              <tr key={row.key} className="border-t border-border">
                <th
                  scope="row"
                  className="px-2 py-2 align-top font-semibold break-keep"
                >
                  {row.name}
                </th>
                <td className="px-2 py-2 break-keep">{row.relations}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
