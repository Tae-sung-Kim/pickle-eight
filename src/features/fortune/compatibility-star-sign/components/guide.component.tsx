import type { JSX } from 'react';

import { CollapsibleComponent } from '@/components/common/collapsible.component';
import { FORTUNE_COMPATIBILITY_GRADES } from '@/features/fortune/constants/fortune-compatibility-grade.constant';
import {
  FORTUNE_COMPATIBILITY_ELEMENT_RELATION_GUIDE,
  FORTUNE_COMPATIBILITY_GRADE_RULE_HEADING,
  FORTUNE_COMPATIBILITY_STAR_SIGN_GRADE_RULE_PARAGRAPHS,
  FORTUNE_COMPATIBILITY_STAR_SIGN_GUIDE,
  FORTUNE_COMPATIBILITY_TABLE_CAPTIONS,
} from '@/features/fortune/constants/fortune-compatibility-guide.constant';
import { FORTUNE_COMPATIBILITY_STAR_SIGN_INTRO } from '@/features/fortune/constants/fortune-compatibility-intro.constant';
import {
  FORTUNE_COMPATIBILITY_ELEMENT_NAMES,
  FORTUNE_COMPATIBILITY_ELEMENT_RELATION_NAMES,
  FORTUNE_COMPATIBILITY_STAR_SIGN_ELEMENTS,
  FORTUNE_COMPATIBILITY_STAR_SIGN_GRADE_BY_RELATION,
} from '@/features/fortune/constants/fortune-compatibility-star-sign.constant';
import { FORTUNE_STAR_SIGNS } from '@/features/fortune/constants/fortune-star-sign.constant';
import type { FortuneCompatibilityElementRelationKeyType } from '@/features/fortune/types/fortune-compatibility.type';

// 표 머리글. 화면 구조 라벨이라 문단 상수가 아닌 이 파일에 둔다
const TABLE_HEADERS = {
  element: '원소',
  signs: '별자리',
  grade: '등급',
  relation: '원소 관계',
} as const;

const ELEMENT_KEYS = Object.keys(
  FORTUNE_COMPATIBILITY_ELEMENT_NAMES
) as (keyof typeof FORTUNE_COMPATIBILITY_ELEMENT_NAMES)[];

const ELEMENT_RELATION_KEYS = Object.keys(
  FORTUNE_COMPATIBILITY_ELEMENT_RELATION_GUIDE
) as FortuneCompatibilityElementRelationKeyType[];

// 등급 규칙 첫 문장은 접힌 제목 줄 note, 나머지 원문은 본문에 그대로 둔다
const [GRADE_RULE_FIRST, ...GRADE_RULE_OTHERS] =
  FORTUNE_COMPATIBILITY_STAR_SIGN_GRADE_RULE_PARAGRAPHS;
const [GRADE_RULE_NOTE, ...GRADE_RULE_REST_PARTS] =
  GRADE_RULE_FIRST.split(/(?<=\.) /);
const GRADE_RULE_REST = GRADE_RULE_REST_PARTS.join(' ');

const H3_CLASS =
  'text-lg leading-snug font-semibold break-keep text-foreground';
const P_CLASS = 'max-w-[68ch] text-sm leading-7 text-foreground sm:text-base';
const TABLE_CLASS =
  'w-full max-w-xl border-collapse text-left text-sm leading-7 text-foreground';

/**
 * FortuneCompatibilityStarSignGuideComponent
 * - 별자리 궁합 소개 + 원소표 + 원소 관계 4개 + 등급 규칙 표. 서버 컴포넌트.
 * - 표의 행은 규칙 상수에서 만든다. 같은 별자리 전용 문구와 개인 결과는 넣지 않는다.
 */
export function FortuneCompatibilityStarSignGuideComponent(): JSX.Element {
  return (
    <section className="space-y-6">
      {FORTUNE_COMPATIBILITY_STAR_SIGN_INTRO.map((section) => (
        <CollapsibleComponent
          key={section.heading}
          heading={section.heading}
          level={2}
        >
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className={P_CLASS}>
              {paragraph}
            </p>
          ))}
        </CollapsibleComponent>
      ))}

      {FORTUNE_COMPATIBILITY_STAR_SIGN_GUIDE.map((section) => (
        <CollapsibleComponent
          key={section.heading}
          heading={section.heading}
          level={2}
        >
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className={P_CLASS}>
              {paragraph}
            </p>
          ))}
          <div className="overflow-x-auto">
            <table className={TABLE_CLASS}>
              <caption className="sr-only">
                {FORTUNE_COMPATIBILITY_TABLE_CAPTIONS.element}
              </caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="px-2 py-2 font-semibold">
                    {TABLE_HEADERS.element}
                  </th>
                  <th scope="col" className="px-2 py-2 font-semibold">
                    {TABLE_HEADERS.signs}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ELEMENT_KEYS.map((element) => (
                  <tr key={element} className="border-b border-border">
                    <th
                      scope="row"
                      className="px-2 py-2 font-semibold whitespace-nowrap"
                    >
                      {FORTUNE_COMPATIBILITY_ELEMENT_NAMES[element]}
                    </th>
                    <td className="px-2 py-2">
                      {FORTUNE_STAR_SIGNS.filter(
                        (sign) =>
                          FORTUNE_COMPATIBILITY_STAR_SIGN_ELEMENTS[sign.key] ===
                          element
                      ).map((sign, index) => (
                        <span key={sign.key} className="whitespace-nowrap">
                          {index > 0 ? ', ' : ''}
                          {sign.name}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            {ELEMENT_RELATION_KEYS.map((relation) => {
              const guide =
                FORTUNE_COMPATIBILITY_ELEMENT_RELATION_GUIDE[relation];
              return (
                <div key={relation} className="space-y-1">
                  <h3 className={H3_CLASS}>{guide.heading}</h3>
                  <p className={P_CLASS}>{guide.paragraph}</p>
                </div>
              );
            })}
          </div>
        </CollapsibleComponent>
      ))}

      <CollapsibleComponent
        heading={FORTUNE_COMPATIBILITY_GRADE_RULE_HEADING}
        level={2}
        note={GRADE_RULE_NOTE}
      >
        {[GRADE_RULE_REST, ...GRADE_RULE_OTHERS].map((paragraph) => (
          <p key={paragraph} className={P_CLASS}>
            {paragraph}
          </p>
        ))}
        <div className="overflow-x-auto">
          <table className={TABLE_CLASS}>
            <caption className="sr-only">
              {FORTUNE_COMPATIBILITY_TABLE_CAPTIONS.starSign}
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-2 py-2 font-semibold">
                  {TABLE_HEADERS.grade}
                </th>
                <th scope="col" className="px-2 py-2 font-semibold">
                  {TABLE_HEADERS.relation}
                </th>
              </tr>
            </thead>
            <tbody>
              {FORTUNE_COMPATIBILITY_GRADES.map((grade) => (
                <tr key={grade.key} className="border-t border-border">
                  <th
                    scope="row"
                    className="px-2 py-2 font-semibold whitespace-nowrap"
                  >
                    {grade.name}
                  </th>
                  <td className="px-2 py-2">
                    {ELEMENT_RELATION_KEYS.filter(
                      (relation) =>
                        FORTUNE_COMPATIBILITY_STAR_SIGN_GRADE_BY_RELATION[
                          relation
                        ] === grade.key
                    )
                      .map(
                        (relation) =>
                          FORTUNE_COMPATIBILITY_ELEMENT_RELATION_NAMES[relation]
                      )
                      .join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleComponent>
    </section>
  );
}
