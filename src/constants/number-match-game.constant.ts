export const NUMBER_MATCH_GAME_GRID_COLS_MAP: { [key: number]: string } = {
  6: 'grid-cols-6',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
};
export const NUMBER_MATCH_GAME_MAP_SIZE_OPTIONS: { [key: number]: number[] } = {
  2: [6, 8, 10],
  3: [6, 9],
};

export enum NUMBER_MATCH_GAME_CARD_STATUS {
  HIDDEN = 'hidden',
  VISIBLE = 'visible',
  MATCHED = 'matched',
  SELECTED = 'selected',
}
