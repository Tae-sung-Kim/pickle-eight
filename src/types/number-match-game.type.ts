import { NUMBER_MATCH_GAME_CARD_STATUS_ENUM } from "@/constants/number-match-game.constant";

export type NumberMatchCardStatusType =
  (typeof NUMBER_MATCH_GAME_CARD_STATUS_ENUM)[keyof typeof NUMBER_MATCH_GAME_CARD_STATUS_ENUM];

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
