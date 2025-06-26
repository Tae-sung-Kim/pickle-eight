export type DiceComponentPropsType = {
  values: [number, number];
  rolling: boolean;
  winner?: boolean;
  isDouble?: boolean;
};

export type DicePlayerListComponentPropsType = {
  names: string[];
  diceValues: number[][];
  isRolling: boolean;
  winnerIndexes: number[];
  onRemove: (index: number) => void;
};

export type DicePlayerComponentPropsType = {
  name: string;
  diceValues: [number, number] | undefined;
  isRolling: boolean;
  isWinner: boolean;
  onRemove: () => void;
  index: number;
};

export type DiceInputComponentPropsType = {
  addName: (name: string) => boolean;
};

export type DiceRollButtonPropsType = {
  onClick: () => void;
  onReset: () => void;
  disabled: boolean;
  isRolling: boolean;
  showReset?: boolean;
};
