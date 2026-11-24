import { describe, expect, test } from 'vitest';
import { parseMealAreaInput } from '@/features/meal/utils/meal-area.util';

const EMPTY = { status: 'empty' } as const;
const invalid = (reason: 'invalid_char' | 'too_long' | 'too_many_digits') =>
  ({ status: 'invalid', reason }) as const;
const valid = (value: string) => ({ status: 'valid', value }) as const;

describe('AC-4: 동네 이름 입력 규칙', () => {
  test.each([
    ['빈 문자열', ''],
    ['공백만', '   '],
    ['탭·줄바꿈만', '\t\n'],
    ['전각 공백만', '　'],
    ['NBSP만', ' '],
  ])('%s는 empty', (_label, raw) => {
    expect(parseMealAreaInput(raw)).toEqual(EMPTY);
  });

  test('앞뒤 공백 제거, 연속 공백·탭·줄바꿈은 한 칸', () => {
    expect(parseMealAreaInput(' 강남역 ')).toEqual(valid('강남역'));
    expect(parseMealAreaInput('2호선   강남역')).toEqual(valid('2호선 강남역'));
    expect(parseMealAreaInput('2호선\t\n 강남역')).toEqual(
      valid('2호선 강남역')
    );
  });

  test.each([
    '강남역',
    '역삼동',
    'Gangnam',
    '역삼1동',
    '을지로3가',
    '종로·광화문',
    '서울-강남',
  ])('%s는 valid', (raw) => {
    expect(parseMealAreaInput(raw)).toEqual(valid(raw));
  });

  test('길이: 정리 뒤 20자 valid, 21자 too_long', () => {
    expect(parseMealAreaInput('가'.repeat(20))).toEqual(valid('가'.repeat(20)));
    expect(parseMealAreaInput('가'.repeat(21))).toEqual(invalid('too_long'));
  });

  test('연속 공백이 한 칸으로 줄어 20자가 되면 valid', () => {
    const raw = `${'가'.repeat(9)}   ${'나'.repeat(10)}`;
    expect(raw.length).toBeGreaterThan(20);
    expect(parseMealAreaInput(raw)).toEqual(
      valid(`${'가'.repeat(9)} ${'나'.repeat(10)}`)
    );
  });

  test.each([
    'https://a',
    'a/b',
    'a:b',
    'a?b',
    'a&b',
    '<b>',
    '강남역😀',
    '강남,역삼',
    'ㄱ',
    'ㅏ',
    '강남역!',
    '#',
    '%',
    '"',
    "'",
    'Ａ',
    '강​남',
    'ㆍ',
  ])('%j는 invalid_char', (raw) => {
    expect(parseMealAreaInput(raw)).toEqual(invalid('invalid_char'));
  });

  test.each(['010-1234-5678', '01012345678', '역삼동 12345', '1-2-3-4-5-6-7'])(
    '%j는 too_many_digits (전화번호·상세 번지 모양)',
    (raw) => {
      expect(parseMealAreaInput(raw)).toEqual(invalid('too_many_digits'));
    }
  );

  test('숫자 제한 경계: 연속 4자·전체 6개는 valid', () => {
    expect(parseMealAreaInput('1234')).toEqual(valid('1234'));
    expect(parseMealAreaInput('12-34-56')).toEqual(valid('12-34-56'));
  });

  test('21자 이상이면서 허용 안 되는 문자가 있으면 invalid_char가 먼저', () => {
    expect(parseMealAreaInput(`${'가'.repeat(25)}!`)).toEqual(
      invalid('invalid_char')
    );
  });

  test('NFD 입력은 NFC로 바뀐다', () => {
    const nfd = '강남역'.normalize('NFD');
    expect(nfd).not.toBe('강남역');
    expect(parseMealAreaInput(nfd)).toEqual(valid('강남역'));
  });

  test('순수성: 같은 입력은 같은 결과', () => {
    for (const raw of ['강남역', '', 'a/b', '가'.repeat(21)]) {
      expect(parseMealAreaInput(raw)).toEqual(parseMealAreaInput(raw));
    }
  });
});
