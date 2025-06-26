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
