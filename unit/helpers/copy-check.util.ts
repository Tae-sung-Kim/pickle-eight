export type NamedTextType = { where: string; text: string };

export type CopyRuleType = {
  forbiddenTerms: readonly string[];
  forbiddenPatterns: readonly RegExp[];
  allowedSentences?: readonly string[];
};

export type StyleReportType = {
  /** 명백한 해요체 (자동 실패) */
  hard: string[];
  /** 의문형 해요체 (후보) */
  questionHaeyo: string[];
  /** 요로 끝나지만 명백하지 않은 문장 (후보) */
  haeyoCandidates: string[];
  /** 다·까로 끝나지 않는 문장 (후보) */
  nonHabnidaCandidates: string[];
};

const HARD_HAEYO = /(예요|에요|세요|네요|군요|죠|지요)$/;
const QUESTION_HAEYO = /(인가요|할까요|일까요|나요|가요|까요|어요|아요|여요)$/;

/** 객체·배열·문자열을 재귀로 풀어 문자열만 모은다 (함수, 숫자, 정규식 제외) */
export function flattenStrings(
  value: unknown,
  where: string,
  out: NamedTextType[] = []
): NamedTextType[] {
  if (typeof value === 'string') {
    out.push({ where, text: value });
  } else if (Array.isArray(value)) {
    for (const [i, item] of value.entries()) {
      flattenStrings(item, `${where}[${i}]`, out);
    }
  } else if (value && typeof value === 'object' && !(value instanceof RegExp)) {
    for (const [k, v] of Object.entries(value)) {
      flattenStrings(v, `${where}.${k}`, out);
    }
  }
  return out;
}

export function collectTexts(
  entries: ReadonlyArray<readonly [string, unknown]>
): NamedTextType[] {
  const out: NamedTextType[] = [];
  for (const [where, value] of entries) flattenStrings(value, where, out);
  return out;
}

/** 허용 예외 문장을 먼저 지운다 */
export function stripAllowed(
  text: string,
  allowedSentences: readonly string[] = []
): string {
  let result = text;
  for (const sentence of allowedSentences) {
    result = result.split(sentence).join('');
  }
  return result;
}

/** 긴 문장은 걸린 자리 앞뒤만 보여 준다 */
export function excerpt(text: string, index: number, length: number): string {
  if (text.length <= 110) return text;
  const start = Math.max(0, index - 35);
  return `…${text.slice(start, index + length + 35)}…`;
}

/** 금지 표현·공백 변형·금지 패턴 위반 목록. 비어 있어야 통과 */
export function findForbidden(
  item: NamedTextType,
  rule: CopyRuleType
): string[] {
  const text = stripAllowed(item.text, rule.allowedSentences);
  const squeezed = text.replace(/\s+/g, '');
  const found: string[] = [];
  for (const term of rule.forbiddenTerms) {
    const index = text.indexOf(term);
    if (index >= 0) {
      found.push(
        `${item.where}: 금지 표현 "${term}" -> ${excerpt(text, index, term.length)}`
      );
    } else if (/\s/.test(term) && squeezed.includes(term.replace(/\s+/g, ''))) {
      found.push(`${item.where}: 금지 표현(공백 변형) "${term}" -> ${text}`);
    }
  }
  for (const pattern of rule.forbiddenPatterns) {
    // g·y 플래그의 lastIndex 상태를 피하려고 새로 만든다
    const fresh = new RegExp(
      pattern.source,
      pattern.flags.replace(/[gy]/g, '')
    );
    const match = fresh.exec(text);
    if (match) {
      found.push(
        `${item.where}: 금지 패턴 ${pattern} -> ${excerpt(text, match.index, match[0].length)}`
      );
    }
  }
  return found;
}

/** 문장 끝 기호와 따옴표·괄호를 뗀 끝부분 */
export function stripEnding(sentence: string): string {
  return sentence.replace(/[\s.?!…"'”’)\]]+$/g, '');
}

/** 마침표·물음표·느낌표로 끝나는 문장만 문장으로 본다 (짧은 명사형 라벨은 제외) */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => /[.?!]["'”’)\]]*$/.test(s));
}

/** 마침표·물음표·느낌표 뒤 공백 기준으로만 나눈다 (끝 기호 없는 조각도 유지) */
export function splitSentencesLoose(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 합니다체 판정. hard만 자동 실패, 나머지는 후보 */
export function checkHabnidaStyle(
  items: readonly NamedTextType[]
): StyleReportType {
  const report: StyleReportType = {
    hard: [],
    questionHaeyo: [],
    haeyoCandidates: [],
    nonHabnidaCandidates: [],
  };
  const seen = new Set<string>();
  for (const item of items) {
    for (const sentence of splitSentences(item.text)) {
      if (seen.has(sentence)) continue;
      seen.add(sentence);
      const ending = stripEnding(sentence);
      const line = `${item.where}: ${sentence}`;
      if (HARD_HAEYO.test(ending)) {
        report.hard.push(line);
      } else if (QUESTION_HAEYO.test(ending)) {
        report.questionHaeyo.push(line);
      } else if (/요$/.test(ending)) {
        report.haeyoCandidates.push(line);
      } else if (!/(다|까)$/.test(ending)) {
        report.nonHabnidaCandidates.push(line);
      }
    }
  }
  return report;
}
