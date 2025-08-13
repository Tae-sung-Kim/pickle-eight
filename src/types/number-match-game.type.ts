export type NumberMatchCardStatusType =
  | 'hidden'
  | 'visible'
  | 'matched'
  | 'selected';

export type NumberMatchCardType = {
  id: number;
  value: number;
  status: NumberMatchCardStatusType;
};
