import { describe, expect, test } from 'vitest';
import {
  createFortuneCompatibilityFlowReducer,
  FORTUNE_COMPATIBILITY_FLOW_INITIAL_STATE,
  type FortuneCompatibilityFlowStateType,
} from '@/features/fortune/hooks/use-compatibility-flow.hook';
import type {
  FortuneBirthInputType,
  FortuneTtiKeyType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import { getSolarTermTime } from '@/features/fortune/utils/fortune-solar-term.util';
import {
  determineFortuneTti,
  getTtiKeyByYear,
  resolveFortuneTtiWithTime,
} from '@/features/fortune/utils/fortune-tti.util';

type StateType = FortuneCompatibilityFlowStateType<FortuneTtiKeyType>;

const TODAY: FortuneYmdType = { year: 2026, month: 11, day: 24 };
const reduce = createFortuneCompatibilityFlowReducer<FortuneTtiKeyType>({
  determine: determineFortuneTti,
  resolveWithTime: resolveFortuneTtiWithTime,
});
const INITIAL = FORTUNE_COMPATIBILITY_FLOW_INITIAL_STATE as StateType;

function solar(
  year: number,
  month: number,
  day: number
): FortuneBirthInputType {
  return { calendar: 'solar', year, month, day, isLeapMonth: false };
}

function submit(
  state: StateType,
  input: Partial<FortuneBirthInputType>,
  today: FortuneYmdType = TODAY
): StateType {
  return reduce(state, { type: 'SUBMIT', input, today });
}

/** 성인 두 명의 일반 날짜(입춘 경계가 아닌 날) */
const ADULT_A = solar(1990, 5, 5);
const ADULT_B = solar(1985, 9, 9);

function lichunDay(year: number): FortuneYmdType {
  const t = getSolarTermTime(year, 2);
  if (!t) throw new Error('표 없음');
  return { year, month: t.month, day: t.day };
}

describe('AC-4 입력 오류는 그 단계에 머물고 결과를 만들지 않는다', () => {
  const cases: ReadonlyArray<
    readonly [string, Partial<FortuneBirthInputType>, string]
  > = [
    ['2월 30일', solar(2000, 2, 30), 'invalid-date'],
    ['1919년', solar(1919, 6, 1), 'before-min'],
    ['2029년', solar(2029, 6, 1), 'after-max'],
    ['KST 오늘 이후', solar(2026, 11, 25), 'future'],
    ['빈 칸', { calendar: 'solar', year: 1990 }, 'empty'],
  ];

  test.each(cases)(
    '첫 번째 사람 %s -> first 단계, 오류 %s',
    (_n, input, error) => {
      const next = submit(INITIAL, input);
      expect(next.step).toBe('first');
      expect(next).toMatchObject({ person: { step: 'input', error } });
    }
  );

  test.each(cases)(
    '두 번째 사람 %s -> second 단계에 머문다',
    (_n, input, error) => {
      const second = submit(INITIAL, ADULT_A);
      expect(second.step).toBe('second');
      const next = submit(second, input);
      expect(next.step).toBe('second');
      expect(next).toMatchObject({ person: { step: 'input', error } });
      // 첫 번째 사람은 유지된다
      expect(next).toMatchObject({ first: { key: getTtiKeyByYear(1990) } });
    }
  );

  test('오류 뒤 올바른 값을 넣으면 이어서 진행한다', () => {
    const bad = submit(submit(INITIAL, ADULT_A), solar(2000, 2, 30));
    const ok = submit(bad, ADULT_B);
    expect(ok.step).toBe('result');
  });
});

describe('연령: 어느 한 사람이라도 만 14세 미만이면 연령 안내, 두 값 폐기', () => {
  test('생일 당일(만 14세)은 통과, 생일 전날(만 13세)은 차단 - 첫 번째 사람', () => {
    expect(submit(INITIAL, solar(2012, 11, 24)).step).toBe('second');
    expect(submit(INITIAL, solar(2012, 11, 25))).toEqual({
      step: 'age-blocked',
    });
  });

  test('두 번째 사람이 미만이면 첫 번째 값도 버린다', () => {
    const blocked = submit(submit(INITIAL, ADULT_A), solar(2012, 11, 25));
    expect(blocked).toEqual({ step: 'age-blocked' });
    expect(JSON.stringify(blocked)).not.toMatch(/1990|first|key/);
  });

  test('두 번째 사람이 생일 당일(만 14세)이면 결과로 간다', () => {
    expect(submit(submit(INITIAL, ADULT_A), solar(2012, 11, 24)).step).toBe(
      'result'
    );
  });

  test('연령 안내에서는 다시 입력·제출·후보 액션이 모두 무시된다', () => {
    const blocked = submit(INITIAL, solar(2020, 1, 1));
    expect(reduce(blocked, { type: 'RESET' })).toBe(blocked);
    expect(submit(blocked, ADULT_A)).toBe(blocked);
    expect(reduce(blocked, { type: 'SWAP_CANDIDATE', target: 'first' })).toBe(
      blocked
    );
  });
});

describe('결과 상태에는 생년월일이 남지 않는다', () => {
  test('사람마다 key, isEarlyYear, otherKey만 있다', () => {
    const result = submit(submit(INITIAL, solar(1990, 1, 20)), ADULT_B);
    expect(result).toEqual({
      step: 'result',
      first: { key: getTtiKeyByYear(1989), isEarlyYear: true, otherKey: null },
      second: {
        key: getTtiKeyByYear(1985),
        isEarlyYear: false,
        otherKey: null,
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/\d{4}/);
  });

  test('첫 번째 사람 판정이 끝난 second 단계에도 날짜 값이 없다', () => {
    const second = submit(INITIAL, ADULT_A);
    expect(second).toMatchObject({
      step: 'second',
      person: { step: 'input', error: null },
    });
    expect(JSON.stringify(second)).not.toMatch(/1990|"5"/);
  });
});

describe('시각 모름: 후보를 고르면 바로 다음 단계', () => {
  const day = lichunDay(2000);
  const dayInput = solar(day.year, day.month, day.day);

  test('첫 번째 사람: 입춘 당일 -> 시각 모름 -> 후보 선택 즉시 second', () => {
    let state = submit(INITIAL, dayInput);
    expect(state).toMatchObject({
      step: 'first',
      person: { step: 'need-time' },
    });
    state = reduce(state, { type: 'TIME_UNKNOWN' });
    expect(state).toMatchObject({ step: 'first', person: { step: 'choose' } });
    const chosen = getTtiKeyByYear(2000);
    const other = getTtiKeyByYear(1999);
    state = reduce(state, { type: 'CHOOSE', key: chosen });
    expect(state).toMatchObject({
      step: 'second',
      first: { key: chosen, otherKey: other },
    });
  });

  test('후보가 아닌 키는 무시한다', () => {
    let state = reduce(submit(INITIAL, dayInput), { type: 'TIME_UNKNOWN' });
    const before = state;
    state = reduce(state, {
      type: 'CHOOSE',
      key: getTtiKeyByYear(2003),
    });
    expect(state).toBe(before);
  });

  test('두 번째 사람도 후보 선택 즉시 결과, 다른 후보로 바꿀 수 있다', () => {
    let state = submit(INITIAL, ADULT_A);
    state = reduce(submit(state, dayInput), { type: 'TIME_UNKNOWN' });
    const chosen = getTtiKeyByYear(1999);
    state = reduce(state, { type: 'CHOOSE', key: chosen });
    expect(state).toMatchObject({
      step: 'result',
      second: { key: chosen, otherKey: getTtiKeyByYear(2000) },
    });

    const swapped = reduce(state, { type: 'SWAP_CANDIDATE', target: 'second' });
    expect(swapped).toMatchObject({
      second: { key: getTtiKeyByYear(2000), otherKey: chosen },
    });
    // 후보가 없는 사람은 바뀌지 않는다
    expect(reduce(state, { type: 'SWAP_CANDIDATE', target: 'first' })).toBe(
      state
    );
  });

  test('결과가 아닌 단계의 후보 바꾸기는 무시한다', () => {
    const second = submit(INITIAL, ADULT_A);
    expect(reduce(second, { type: 'SWAP_CANDIDATE', target: 'first' })).toBe(
      second
    );
  });

  test('시각을 넣으면 시각 기준으로 판정하고 다른 후보는 없다', () => {
    const t = getSolarTermTime(2000, 2);
    if (!t) throw new Error('표 없음');
    let state = submit(INITIAL, dayInput);
    state = reduce(state, {
      type: 'SUBMIT_TIME',
      time: { hour: t.hour, minute: t.minute },
    });
    expect(state).toMatchObject({
      step: 'second',
      first: { key: getTtiKeyByYear(2000), otherKey: null },
    });
  });
});

describe('다시 입력', () => {
  test('첫 번째 단계(오류 상태)에서 처음 상태로', () => {
    const err = submit(INITIAL, solar(2000, 2, 30));
    expect(reduce(err, { type: 'RESET' })).toEqual(INITIAL);
  });

  test('두 번째 사람 단계에서 처음 상태로, 첫 번째 사람 값이 사라진다', () => {
    const second = submit(INITIAL, ADULT_A);
    const reset = reduce(second, { type: 'RESET' });
    expect(reset).toEqual(INITIAL);
    expect(JSON.stringify(reset)).not.toContain(getTtiKeyByYear(1990));
  });

  test('시각 질문 중에도 처음 상태로', () => {
    const day = lichunDay(2000);
    const asking = submit(INITIAL, solar(day.year, day.month, day.day));
    expect(asking).toMatchObject({ person: { step: 'need-time' } });
    expect(reduce(asking, { type: 'RESET' })).toEqual(INITIAL);
  });

  test('결과에서 처음 상태로', () => {
    const result = submit(submit(INITIAL, ADULT_A), ADULT_B);
    expect(reduce(result, { type: 'RESET' })).toEqual(INITIAL);
  });

  test('결과 단계에서 제출 액션은 무시한다', () => {
    const result = submit(submit(INITIAL, ADULT_A), ADULT_B);
    expect(submit(result, ADULT_A)).toBe(result);
  });
});
