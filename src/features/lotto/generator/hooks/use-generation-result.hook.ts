import { useMemo, useReducer } from 'react';

type LottoGenerationStateType = {
  numbersList: number[][];
  isGenerating: boolean;
  generatedAt: string;
  rngLabel: string;
  error: string | null;
};

type LottoGenerationActionType =
  | { type: 'start' }
  | { type: 'success'; numbersList: number[][]; rngLabel: string }
  | { type: 'fail'; error: string };

const INITIAL_STATE: LottoGenerationStateType = {
  numbersList: [],
  isGenerating: false,
  generatedAt: '',
  rngLabel: '',
  error: null,
};

// 실패해도 직전 결과는 화면에 남긴다
function reducer(
  state: LottoGenerationStateType,
  action: LottoGenerationActionType
): LottoGenerationStateType {
  switch (action.type) {
    case 'start':
      return { ...state, isGenerating: true, error: null };
    case 'success':
      return {
        ...state,
        isGenerating: false,
        numbersList: action.numbersList,
        rngLabel: action.rngLabel,
        generatedAt: new Date().toLocaleString('ko-KR', { hour12: false }),
      };
    case 'fail':
      return { ...state, isGenerating: false, error: action.error };
  }
}

// 번호 생성 결과(번호, 생성 중 여부, 시각, 난수 소스, 오류)를 한 번에 관리한다
export function useGenerationResult() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  // dispatch는 바뀌지 않으므로 액션 함수도 한 번만 만든다
  const actions = useMemo(
    () => ({
      start: () => dispatch({ type: 'start' }),
      succeed: (numbersList: number[][], rngLabel: string) =>
        dispatch({ type: 'success', numbersList, rngLabel }),
      fail: (error: string) => dispatch({ type: 'fail', error }),
    }),
    []
  );
  return { ...state, ...actions };
}
