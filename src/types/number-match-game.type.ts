import { NUMBER_MATCH_GAME_CARD_STATUS } from '@/constants';

export type NumberMatchCardStatusType =
  (typeof NUMBER_MATCH_GAME_CARD_STATUS)[keyof typeof NUMBER_MATCH_GAME_CARD_STATUS];

export type NumberMatchCardType = {
  id: number;
  value: number;
  status: NumberMatchCardStatusType;
};

export type NumberMatchGameBoardType = {
  cards: NumberMatchCardType[];
  onCardClick: (cardId: number) => void;
  mapSize: number;
  getCardStatus: (card: NumberMatchCardType) => NumberMatchCardStatusType;
};

export type NumberMatchGameCardType = {
  card: NumberMatchCardType;
  onClick: (cardId: number) => void;
  status: NumberMatchCardStatusType;
};

export type NumberMatchGameControlsType = {
  matchCount: number;
  isGameActive: boolean;
  mapSize: number;
  setMatchCount: (count: number) => void;
  setMapSize: (size: number) => void;
  onStartGame: () => void;
  onReset: () => void;
};

export type NumberMatchGameOverModalType = {
  isOpen: boolean;
  moves: number;
};
