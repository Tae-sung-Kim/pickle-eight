import { useCallback, useReducer } from 'react';
import { FORTUNE_MIN_AGE } from '@/features/fortune/constants/fortune-input.constant';
import { FORTUNE_SAJU_LATE_ZI_STEM_BASIS } from '@/features/fortune/constants/fortune-saju.constant';
import type {
  FortuneBirthErrorType,
  FortuneBirthInputType,
  FortuneClockTimeType,
  FortuneYmdType,
} from '@/features/fortune/types/fortune.type';
import { resolveFortuneBirth } from '@/features/fortune/utils/fortune-birth.util';
import { calculateFortuneManAge } from '@/features/fortune/utils/fortune-date.util';
import {
  buildFortuneSajuCharts,
  getFortuneSajuBoundary,
} from '@/features/fortune/utils/fortune-saju.util';

/** 차트·오행·십신·표준시 안내 여부는 상태에 넣지 않고 렌더링 중 계산한다(design V4.1) */
export type FortuneSajuFlowStateType =
  | Readonly<{ step: 'input'; error: FortuneBirthErrorType | null }>
  /** 입력값을 남기지 않는다 */
  | Readonly<{ step: 'age-blocked' }>
  /** 연령 통과 후 시간 입력 */
  | Readonly<{
      step: 'time';
      solar: FortuneYmdType;
      isFromLunar: boolean;
    }>
  /** 경계일 + 시간 모름 */
  | Readonly<{
      step: 'choose';
      solar: FortuneYmdType;
      isFromLunar: boolean;
    }>
  | Readonly<{
      step: 'done';
      solar: FortuneYmdType;
      isFromLunar: boolean;
      time: FortuneClockTimeType | null;
      /** need-choice에서 고른 후보. 0 절기 전, 1 절기 후. 고를 필요가 없었으면 null */
      candidate: 0 | 1 | null;
    }>;

export type FortuneSajuFlowActionType =
  | Readonly<{
      type: 'SUBMIT';
      input: Partial<FortuneBirthInputType>;
      today: FortuneYmdType;
    }>
  | Readonly<{ type: 'SUBMIT_TIME'; time: FortuneClockTimeType }>
  | Readonly<{ type: 'TIME_UNKNOWN' }>
  | Readonly<{ type: 'CHOOSE'; candidate: 0 | 1 }>
  | Readonly<{ type: 'RESET' }>;

export const FORTUNE_SAJU_FLOW_INITIAL_STATE = {
  step: 'input',
  error: null,
} as const satisfies FortuneSajuFlowStateType;

const UNSUPPORTED_STATE = {
  step: 'input',
  error: 'out-of-table',
} as const satisfies FortuneSajuFlowStateType;

const MAX_HOUR = 23;
const MAX_MINUTE = 59;

/** 0~23시, 0~59분 형식만 본다. 오늘 날짜의 늦은 시각은 막지 않는다(S2-9) */
function isValidClockTime(time: FortuneClockTimeType): boolean {
  return (
    Number.isInteger(time.hour) &&
    Number.isInteger(time.minute) &&
    time.hour >= 0 &&
    time.hour <= MAX_HOUR &&
    time.minute >= 0 &&
    time.minute <= MAX_MINUTE
  );
}

function submit(
  action: Extract<FortuneSajuFlowActionType, { type: 'SUBMIT' }>
): FortuneSajuFlowStateType {
  const resolved = resolveFortuneBirth(action.input, action.today);
  if (!resolved.ok) {
    return { step: 'input', error: resolved.error };
  }
  const { solar, isFromLunar } = resolved;

  if (calculateFortuneManAge(solar, action.today) < FORTUNE_MIN_AGE) {
    return { step: 'age-blocked' };
  }

  // 표 없음(방어 경로)
  try {
    if (getFortuneSajuBoundary(solar) === undefined) {
      return UNSUPPORTED_STATE;
    }
  } catch {
    return UNSUPPORTED_STATE;
  }
  return { step: 'time', solar, isFromLunar };
}

function submitTime(
  state: Extract<FortuneSajuFlowStateType, { step: 'time' }>,
  time: FortuneClockTimeType
): FortuneSajuFlowStateType {
  if (!isValidClockTime(time)) {
    return state;
  }
  const result = buildFortuneSajuCharts(
    state.solar,
    time,
    FORTUNE_SAJU_LATE_ZI_STEM_BASIS
  );
  if (result.kind !== 'single') {
    return UNSUPPORTED_STATE;
  }
  return {
    step: 'done',
    solar: state.solar,
    isFromLunar: state.isFromLunar,
    time,
    candidate: null,
  };
}

function timeUnknown(
  state: Extract<FortuneSajuFlowStateType, { step: 'time' }>
): FortuneSajuFlowStateType {
  const result = buildFortuneSajuCharts(
    state.solar,
    null,
    FORTUNE_SAJU_LATE_ZI_STEM_BASIS
  );
  if (result.kind === 'unsupported') {
    return UNSUPPORTED_STATE;
  }
  if (result.kind === 'need-choice') {
    return {
      step: 'choose',
      solar: state.solar,
      isFromLunar: state.isFromLunar,
    };
  }
  return {
    step: 'done',
    solar: state.solar,
    isFromLunar: state.isFromLunar,
    time: null,
    candidate: null,
  };
}

/** 순수 reducer. 상태가 맞지 않는 액션은 무시한다 */
export function fortuneSajuFlowReducer(
  state: FortuneSajuFlowStateType,
  action: FortuneSajuFlowActionType
): FortuneSajuFlowStateType {
  switch (action.type) {
    case 'SUBMIT':
      return state.step === 'input' ? submit(action) : state;
    case 'SUBMIT_TIME':
      return state.step === 'time' ? submitTime(state, action.time) : state;
    case 'TIME_UNKNOWN':
      return state.step === 'time' ? timeUnknown(state) : state;
    case 'CHOOSE':
      return state.step === 'choose'
        ? {
            step: 'done',
            solar: state.solar,
            isFromLunar: state.isFromLunar,
            time: null,
            candidate: action.candidate,
          }
        : state;
    case 'RESET':
      // age-blocked에는 다시 입력 장치가 없다
      return state.step === 'age-blocked'
        ? state
        : FORTUNE_SAJU_FLOW_INITIAL_STATE;
    default:
      return state;
  }
}

/** 입력 → 연령 확인 → 시간 입력/모름 → (후보 선택) → 결과. 메모리 state만 쓴다 */
export function useSajuFlow() {
  const [state, dispatch] = useReducer(
    fortuneSajuFlowReducer,
    FORTUNE_SAJU_FLOW_INITIAL_STATE as FortuneSajuFlowStateType
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
  const choose = useCallback(
    (candidate: 0 | 1) => dispatch({ type: 'CHOOSE', candidate }),
    []
  );
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return { state, submit, submitTime, setTimeUnknown, choose, reset };
}
