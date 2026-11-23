import { describe, expect, test } from 'vitest';
import { CRISIS_TERMS } from '@/constants/crisis-term.constant';
import { hasCrisisSignal, normalizeCrisisText } from '@/lib/crisis-signal';

describe('normalizeCrisisText', () => {
  test('공백·특수문자를 지우고 소문자로 바꾼다', () => {
    expect(normalizeCrisisText(' 죽 고-싶 다! ')).toBe('죽고싶다');
    expect(normalizeCrisisText('SuI cide.')).toBe('suicide');
  });

  test('NFC로 합쳐 비교한다', () => {
    expect(normalizeCrisisText('자살'.normalize('NFD'))).toBe('자살');
  });

  test('기호만 있으면 빈 문자열이다', () => {
    expect(normalizeCrisisText('...!?  ')).toBe('');
  });
});

describe('hasCrisisSignal', () => {
  test('위기어를 공백·기호로 쪼개도 잡는다', () => {
    expect(hasCrisisSignal('나 죽 고 싶 어', CRISIS_TERMS)).toBe(true);
    expect(hasCrisisSignal('자.살 생각', CRISIS_TERMS)).toBe(true);
    expect(hasCrisisSignal('I want SUICIDE', CRISIS_TERMS)).toBe(true);
  });

  test('오탐 방지: 죽음 단독, 평범한 꿈 소재는 잡지 않는다', () => {
    expect(hasCrisisSignal('죽음', CRISIS_TERMS)).toBe(false);
    expect(hasCrisisSignal('돼지꿈 풀이', CRISIS_TERMS)).toBe(false);
  });

  test('빈 입력과 빈 용어는 false다', () => {
    expect(hasCrisisSignal('', CRISIS_TERMS)).toBe(false);
    expect(hasCrisisSignal('!!!', CRISIS_TERMS)).toBe(false);
    expect(hasCrisisSignal('자살', [''])).toBe(false);
  });

  test('CRISIS_TERMS는 모두 정규화된 형태(공백·대문자 없음)다', () => {
    const bad = CRISIS_TERMS.filter(
      (t) => t === '' || normalizeCrisisText(t) !== t
    );
    expect(bad).toEqual([]);
  });
});
