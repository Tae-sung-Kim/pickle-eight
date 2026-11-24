import { useCallback, useMemo, useReducer } from 'react';
import {
  createFortuneBirthFlowReducer,
  FORTUNE_BIRTH_FLOW_INITIAL_STATE,
  type FortuneBirthFlowActionType,
  type FortuneBirthFlowConfigType,
  type FortuneBirthFlowStateType,
} from '@/features/fortune/hooks/use-birth-flow.hook';
import type {
  FortuneBirthInputType,
  FortuneClockTimeType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';

// 입력값(생년월일)은 이 훅의 state(메모리)에만 둔다. 저장하지 않는다.
// 한 사람의 판정이 끝나면 생년월일을 지우고 키와 표식만 남긴다(design 5.3).

/** 판정이 끝난 한 사람. 생년월일은 없다 */
export type FortuneCompatibilityPersonType<K extends string> = Readonly<{
  key: K;
  /** 1~2월 출생(띠 궁합에서 입춘 기준 안내에 쓴다) */
  isEarlyYear: boolean;
  /** 시각 모름으로 후보를 골랐을 때 고르지 않은 다른 후보. 아니면 null */
  otherKey: K | null;
}>;

/** 입력 중인 사람의 단계. 판정 완료·연령 차단은 바깥 상태가 맡는다 */
type PersonInputStateType<K extends string> = Exclude<
  FortuneBirthFlowStateType<K>,
  Readonly<{ step: 'age-blocked' }> | Readonly<{ step: 'done' }>
>;

export type FortuneCompatibilityFlowStateType<K extends string> =
  | Readonly<{ step: 'first'; person: PersonInputStateType<K> }>
  | Readonly<{
      step: 'second';
      first: FortuneCompatibilityPersonType<K>;
      person: PersonInputStateType<K>;
    }>
  | Readonly<{
      step: 'result';
      first: FortuneCompatibilityPersonType<K>;
      second: FortuneCompatibilityPersonType<K>;
    }>
  /** 두 사람의 값을 모두 버린다 */
  | Readonly<{ step: 'age-blocked' }>;

export type FortuneCompatibilityFlowActionType<K extends string> =
  | Extract<
      FortuneBirthFlowActionType<K>,
      { type: 'SUBMIT' | 'SUBMIT_TIME' | 'TIME_UNKNOWN' | 'CHOOSE' }
    >
  /** 결과 단계에서 그 사람의 키를 다른 후보로 바꾼다 */
  | Readonly<{ type: 'SWAP_CANDIDATE'; target: 'first' | 'second' }>
  /** 처음 상태로. age-blocked에서는 무시한다 */
  | Readonly<{ type: 'RESET' }>;

export const FORTUNE_COMPATIBILITY_FLOW_INITIAL_STATE = {
  step: 'first',
  person: FORTUNE_BIRTH_FLOW_INITIAL_STATE,
} as const satisfies FortuneCompatibilityFlowStateType<string>;

const AGE_BLOCKED_STATE = {
  step: 'age-blocked',
} as const satisfies FortuneCompatibilityFlowStateType<string>;

const OUT_OF_TABLE_INPUT = {
  step: 'input',
  error: 'out-of-table',
} as const satisfies PersonInputStateType<string>;

/** 순수 reducer를 만든다. 상태가 맞지 않는 액션은 무시한다 */
export function createFortuneCompatibilityFlowReducer<K extends string>(
  config: FortuneBirthFlowConfigType<K>
): (
  state: FortuneCompatibilityFlowStateType<K>,
  action: FortuneCompatibilityFlowActionType<K>
) => FortuneCompatibilityFlowStateType<K> {
  const reducePerson = createFortuneBirthFlowReducer<K>(config);

  return function reduce(state, action) {
    if (action.type === 'RESET') {
      return state.step === 'age-blocked'
        ? state
        : FORTUNE_COMPATIBILITY_FLOW_INITIAL_STATE;
    }

    if (action.type === 'SWAP_CANDIDATE') {
      if (state.step !== 'result') {
        return state;
      }
      const target = state[action.target];
      if (target.otherKey === null) {
        return state;
      }
      return {
        ...state,
        [action.target]: {
          ...target,
          key: target.otherKey,
          otherKey: target.key,
        },
      };
    }

    if (state.step === 'result' || state.step === 'age-blocked') {
      return state;
    }

    const before = state.person;
    const next = reducePerson(before, action);
    if (next === before) {
      return state;
    }
    if (next.step === 'age-blocked') {
      return AGE_BLOCKED_STATE;
    }
    if (next.step !== 'done') {
      return { ...state, person: next };
    }
    if (next.key === null) {
      return { ...state, person: OUT_OF_TABLE_INPUT };
    }

    // 후보를 직접 고른 경우만 다른 후보를 기억한다
    const otherKey =
      action.type === 'CHOOSE' && before.step === 'choose'
        ? before.before === next.key
          ? before.after
          : before.before
        : null;
    const person: FortuneCompatibilityPersonType<K> = {
      key: next.key,
      isEarlyYear: next.solar.month <= 2,
      otherKey,
    };

    return state.step === 'first'
      ? {
          step: 'second',
          first: person,
          person: FORTUNE_BIRTH_FLOW_INITIAL_STATE,
        }
      : { step: 'result', first: state.first, second: person };
  };
}

/**
 * 첫 번째 사람 → 두 번째 사람 → 결과 흐름. 판정 함수는 module 상수(안정된 참조)로 넘긴다.
 */
export function useCompatibilityFlow<K extends string>(
  config: FortuneBirthFlowConfigType<K> = {}
) {
  const { determine, resolveWithTime } = config;
  const reducer = useMemo(
    () =>
      createFortuneCompatibilityFlowReducer<K>({ determine, resolveWithTime }),
    [determine, resolveWithTime]
  );
  const [state, dispatch] = useReducer(
    reducer,
    FORTUNE_COMPATIBILITY_FLOW_INITIAL_STATE as FortuneCompatibilityFlowStateType<K>
  );

  const submit = useCallback(
    (input: Partial<FortuneBirthInputType>, today: FortuneYmdType) =>
      dispatch({ type: 'SUBMIT', input, today }),
    []
  );
  const submitTime = useCallback(
    (time: FortuneClockTimeType) => dispatch({ type: 'SUBMIT_TIME', time }),
    []
  );
  const setTimeUnknown = useCallback(
    () => dispatch({ type: 'TIME_UNKNOWN' }),
    []
  );
  const choose = useCallback((key: K) => dispatch({ type: 'CHOOSE', key }), []);
  const swapCandidate = useCallback(
    (target: 'first' | 'second') =>
      dispatch({ type: 'SWAP_CANDIDATE', target }),
    []
  );
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    submit,
    submitTime,
    setTimeUnknown,
    choose,
    swapCandidate,
    reset,
  };
}
