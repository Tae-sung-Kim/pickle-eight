import { useCallback, useMemo, useReducer } from 'react';
import { FORTUNE_MIN_AGE } from '@/features/fortune/constants/fortune-input.constant';
import type {
  FortuneBirthErrorType,
  FortuneBirthInputType,
  FortuneClockTimeType,
  FortuneDetermineType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import { resolveFortuneBirth } from '@/features/fortune/utils/fortune-birth.util';
import { calculateFortuneManAge } from '@/features/fortune/utils/fortune-date.util';

// 상태·액션 타입은 design.md 7.2 그대로. 입력값과 판정 결과는 이 훅의 state(메모리)에만 둔다.
// URL·localStorage·sessionStorage·전역 store에 올리지 않는다(AC-28, AC-30).
export type FortuneBirthFlowStateType<K extends string> =
  | Readonly<{ step: 'input'; error: FortuneBirthErrorType | null }>
  /** 입력값을 남기지 않는다(AC-42, AC-47) */
  | Readonly<{ step: 'age-blocked' }>
  | Readonly<{
      step: 'need-time';
      solar: FortuneYmdType;
      isFromLunar: boolean;
      before: K;
      after: K;
    }>
  /** 시각 모름. 두 후보를 나란히 보이고 정답 표시를 하지 않는다 */
  | Readonly<{
      step: 'choose';
      solar: FortuneYmdType;
      isFromLunar: boolean;
      before: K;
      after: K;
    }>
  /** 개인 일운(오늘의 운세)은 key가 null */
  | Readonly<{
      step: 'done';
      solar: FortuneYmdType;
      isFromLunar: boolean;
      key: K | null;
    }>;

export type FortuneBirthFlowActionType<K extends string> =
  | Readonly<{
      type: 'SUBMIT';
      input: Partial<FortuneBirthInputType>;
      today: FortuneYmdType;
    }>
  | Readonly<{ type: 'SUBMIT_TIME'; time: FortuneClockTimeType }>
  | Readonly<{ type: 'TIME_UNKNOWN' }>
  | Readonly<{ type: 'CHOOSE'; key: K }>
  /** 다시 입력 → input. age-blocked에서는 무시한다 */
  | Readonly<{ type: 'RESET' }>;

/** 판정 함수. 둘 다 없으면 판정 없이 바로 done(key null)이다(오늘의 운세) */
export type FortuneBirthFlowConfigType<K extends string> = Readonly<{
  /** 띠: determineFortuneTti, 별자리: determineFortuneStarSign */
  determine?: (solar: FortuneYmdType) => FortuneDetermineType<K>;
  /** 띠: resolveFortuneTtiWithTime, 별자리: resolveFortuneStarSignWithTime */
  resolveWithTime?: (solar: FortuneYmdType, time: FortuneClockTimeType) => K;
}>;

export const FORTUNE_BIRTH_FLOW_INITIAL_STATE = {
  step: 'input',
  error: null,
} as const satisfies FortuneBirthFlowStateType<string>;

/** 판정 함수가 절기 표 범위 밖이라고 하면(방어 경로, 4.10) 결과 없이 입력 단계로 돌린다 */
const UNSUPPORTED_STATE = {
  step: 'input',
  error: 'out-of-table',
} as const satisfies FortuneBirthFlowStateType<string>;

function submit<K extends string>(
  action: Extract<FortuneBirthFlowActionType<K>, { type: 'SUBMIT' }>,
  config: FortuneBirthFlowConfigType<K>
): FortuneBirthFlowStateType<K> {
  const resolved = resolveFortuneBirth(action.input, action.today);
  if (!resolved.ok) {
    return { step: 'input', error: resolved.error };
  }
  const { solar, isFromLunar } = resolved;

  // 음력 입력도 양력 변환 뒤 같은 기준으로 판정한다(AC-44)
  if (calculateFortuneManAge(solar, action.today) < FORTUNE_MIN_AGE) {
    return { step: 'age-blocked' };
  }

  if (!config.determine) {
    return { step: 'done', solar, isFromLunar, key: null };
  }

  let determined: FortuneDetermineType<K>;
  try {
    determined = config.determine(solar);
  } catch {
    return UNSUPPORTED_STATE;
  }
  if (determined.kind === 'unsupported') {
    return UNSUPPORTED_STATE;
  }
  if (determined.kind === 'single') {
    return { step: 'done', solar, isFromLunar, key: determined.key };
  }
  return {
    step: 'need-time',
    solar,
    isFromLunar,
    before: determined.before,
    after: determined.after,
  };
}

/** 순수 reducer를 만든다. 상태가 맞지 않는 액션은 무시한다 */
export function createFortuneBirthFlowReducer<K extends string>(
  config: FortuneBirthFlowConfigType<K>
): (
  state: FortuneBirthFlowStateType<K>,
  action: FortuneBirthFlowActionType<K>
) => FortuneBirthFlowStateType<K> {
  return function reduce(state, action) {
    switch (action.type) {
      case 'SUBMIT':
        return state.step === 'input' ? submit(action, config) : state;
      case 'SUBMIT_TIME': {
        if (state.step !== 'need-time' || !config.resolveWithTime) {
          return state;
        }
        try {
          return {
            step: 'done',
            solar: state.solar,
            isFromLunar: state.isFromLunar,
            key: config.resolveWithTime(state.solar, action.time),
          };
        } catch {
          return UNSUPPORTED_STATE;
        }
      }
      case 'TIME_UNKNOWN':
        return state.step === 'need-time'
          ? { ...state, step: 'choose' }
          : state;
      case 'CHOOSE':
        return state.step === 'choose' &&
          (action.key === state.before || action.key === state.after)
          ? {
              step: 'done',
              solar: state.solar,
              isFromLunar: state.isFromLunar,
              key: action.key,
            }
          : state;
      case 'RESET':
        // age-blocked에는 다시 입력 장치가 없다(AC-42, design 7.2)
        return state.step === 'age-blocked'
          ? state
          : FORTUNE_BIRTH_FLOW_INITIAL_STATE;
      default:
        return state;
    }
  };
}

/**
 * 입력 → 연령 확인 → (시각 질문 → 후보 선택) → 결과 흐름. 모든 입력 화면이 이 훅 하나를 쓴다.
 * 판정 함수는 module 상수(안정된 참조)로 넘긴다.
 */
export function useBirthFlow<K extends string>(
  config: FortuneBirthFlowConfigType<K> = {}
) {
  const { determine, resolveWithTime } = config;
  const reducer = useMemo(
    () => createFortuneBirthFlowReducer<K>({ determine, resolveWithTime }),
    [determine, resolveWithTime]
  );
  const [state, dispatch] = useReducer(
    reducer,
    FORTUNE_BIRTH_FLOW_INITIAL_STATE as FortuneBirthFlowStateType<K>
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
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return { state, submit, submitTime, setTimeUnknown, choose, reset };
}
