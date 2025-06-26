export type LadderInput = {
  names: string[];
  prizes: string[];
};

export type Ladder = {
  verticals: number;
  horizontals: LadderHorizontal[];
};

export type LadderHorizontal = {
  row: number;
  col: number;
};

export type LadderResult = {
  name: string;
  prize: string;
};
