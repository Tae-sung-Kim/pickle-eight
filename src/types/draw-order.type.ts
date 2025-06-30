export type DrawOrderParticipantType = {
  id: string;
  name: string;
  hasDrawn: boolean;
  drawnItem?: string;
};

export type DrawOrderItemType = {
  id: string;
  label: string;
  isDrawn: boolean;
};

export type DrawOrderStateType = {
  participants: DrawOrderParticipantType[];
  items: DrawOrderItemType[];
  currentTurn: number; // index of participants
  isDrawing: boolean;
  currentItem: DrawOrderItemType | null;
};

export type InputListSectionPropsType = {
  label: string;
  placeholder: string;
  list: string[];
  onAdd: (value: string) => void;
  onRemove: (idx: number) => void;
};
