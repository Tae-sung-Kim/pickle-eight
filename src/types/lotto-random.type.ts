export type LottoGeneratorControlsPropsType = {
  orderCount: number;
  isGenerating: boolean;
  onOrderCountChange: (value: number) => void;
  onGenerate: () => void;
};

export type LottoNumberListPropsType = {
  numbersList: number[][];
  title?: string;
};

export type LottoBallPropsType = {
  number: number;
  index: number;
  isBonus?: boolean;
};
