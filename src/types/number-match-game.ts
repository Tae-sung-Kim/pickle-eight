export type NumberMatchCardStatusType =
  | 'hidden'
  | 'visible'
  | 'selected'
  | 'matched';

export interface NumberMatchCardType {
  id: number;
  value: number;
  status: NumberMatchCardStatusType;
}
