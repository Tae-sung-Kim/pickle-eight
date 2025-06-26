export type LadderConfigType = {
  names: string[];
  prizes: string[];
};

export type LadderType = {
  verticals: number;
  horizontals: LadderHorizontalType[];
};

export type LadderHorizontalType = {
  row: number;
  col: number;
};

export type LadderResultType = {
  name: string;
  prize: string;
};

export type LadderInputComponentPropsType = {
  onCreateLadder: (data: { names: string[]; prizes: string[] }) => void;
};

export type LadderComponentPropsType = {
  ladder: LadderType;
  names: string[];
  prizes: string[];
};

export type LadderGameSectionComponentPropsType = {
  ladder: LadderType;
  config: LadderConfigType;
  onReset: () => void;
  results: LadderResultType[];
};

export type LadderHeaderComponentPropsType = {
  title: string;
  description: string;
};
