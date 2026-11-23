import { describe, expect, it } from 'vitest';
import {
  LUCKY_DRAW_LADDER_RULE,
  LUCKY_DRAW_LOTS_RULE,
  LUCKY_DRAW_ROULETTE_RULE,
} from '@/features/lucky-draw/constants/lucky-draw-limit.constant';
import {
  countLuckyDrawChars,
  getLuckyDrawLadderBlock,
  parseLuckyDrawLines,
} from '@/features/lucky-draw/utils/lucky-draw-input.util';

const lines = (n: number) =>
  Array.from({ length: n }, (_, i) => `a${i}`).join('\n');
const parse = (
  t: string,
  r: typeof LUCKY_DRAW_LADDER_RULE = LUCKY_DRAW_LADDER_RULE
) => parseLuckyDrawLines(t, r, 'p');

describe('줄 해석', () => {
  it('공백, 빈 줄, CRLF', () => {
    const r = parse('  철수 \r\n\r\n   \r\n영희\r\n');
    expect(r.entries.map((e) => e.label)).toEqual(['철수', '영희']);
    expect(r.overflowCount).toBe(0);
    expect(r.tooLongCount).toBe(0);
  });
  it('빈 입력', () => {
    expect(parse('').entries).toEqual([]);
  });
  it('같은 이름도 id가 다르다', () => {
    expect(parse('가\n가\n가').entries.map((e) => e.id)).toEqual([
      'p-0',
      'p-1',
      'p-2',
    ]);
  });
  it('빈 줄을 건너뛰어도 id는 entries 순서', () => {
    expect(parse('가\n\n나').entries.map((e) => e.id)).toEqual(['p-0', 'p-1']);
  });
});

describe('15자 경계', () => {
  it('15자 통과, 16자는 tooLongCount', () => {
    const r = parse(`${'a'.repeat(15)}\n${'a'.repeat(16)}`);
    expect(r.entries).toHaveLength(1);
    expect(r.tooLongCount).toBe(1);
  });
  it('이모지는 코드 포인트 1글자', () => {
    expect(countLuckyDrawChars('😀'.repeat(15))).toBe(15);
    expect(parse('😀'.repeat(15)).entries).toHaveLength(1);
    expect(parse('😀'.repeat(16)).tooLongCount).toBe(1);
  });
  it('한글 15자', () => {
    expect(parse('가'.repeat(15)).entries).toHaveLength(1);
  });
});

describe('개수 제한, 앞의 N개만', () => {
  it('사다리 10개 통과, 11개째 overflow', () => {
    expect(parse(lines(10)).overflowCount).toBe(0);
    const r = parse(lines(11));
    expect(r.entries).toHaveLength(10);
    expect(r.overflowCount).toBe(1);
  });
  it('돌림판 28개 통과, 29번째 줄 overflow', () => {
    expect(parse(lines(28), LUCKY_DRAW_ROULETTE_RULE).overflowCount).toBe(0);
    const r = parse(lines(29), LUCKY_DRAW_ROULETTE_RULE);
    expect(r.entries).toHaveLength(28);
    expect(r.overflowCount).toBe(1);
  });
  it('제비뽑기 30개 통과, 31번째 줄 overflow, 앞의 30개만 남는다', () => {
    expect(parse(lines(30), LUCKY_DRAW_LOTS_RULE).overflowCount).toBe(0);
    const r = parse(lines(31), LUCKY_DRAW_LOTS_RULE);
    expect(r.entries).toHaveLength(30);
    expect(r.overflowCount).toBe(1);
    expect(r.entries[29].label).toBe('a29');
  });
  it('너무 긴 줄은 개수에 안 들어간다', () => {
    const r = parse(`${lines(10)}\n${'x'.repeat(20)}`);
    expect(r.tooLongCount).toBe(1);
    expect(r.overflowCount).toBe(0);
  });
});

describe('getLuckyDrawLadderBlock', () => {
  const p = (n: number) => parse(lines(n));
  it('too-few', () => {
    expect(getLuckyDrawLadderBlock(p(1), p(1))).toBe('too-few');
  });
  it('too-many', () => {
    expect(getLuckyDrawLadderBlock(p(11), p(10))).toBe('too-many');
  });
  it('count-mismatch 개수 다름', () => {
    expect(getLuckyDrawLadderBlock(p(3), p(4))).toBe('count-mismatch');
  });
  it('count-mismatch 결과 overflow', () => {
    expect(getLuckyDrawLadderBlock(p(10), p(11))).toBe('count-mismatch');
  });
  it('통과는 null', () => {
    expect(getLuckyDrawLadderBlock(p(10), p(10))).toBeNull();
  });
});
