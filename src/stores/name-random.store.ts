// src/app/name-picker/store.ts
import { create } from 'zustand';

type NamePickerState = {
  names: string[];
  result: string[];
  isDrawing: boolean;
  setNames: (names: string[]) => void;
  drawNames: (count: number, allowDuplicate: boolean) => void;
  reset: () => void;
};

export const useNameRandomStore = create<NamePickerState>((set, get) => ({
  names: [],
  result: [],
  isDrawing: false,
  setNames: (names) => set({ names }),
  drawNames: (count, allowDuplicate) => {
    const { names } = get();
    const result: string[] = [];
    const availableNames = [...names];

    for (let i = 0; i < count; i++) {
      if (availableNames.length === 0) break;

      const randomIndex = Math.floor(Math.random() * availableNames.length);
      const selected = availableNames[randomIndex];
      result.push(selected);

      if (!allowDuplicate) {
        availableNames.splice(randomIndex, 1);
      }
    }

    set({ result, isDrawing: false });
  },
  reset: () => set({ result: [], isDrawing: false }),
}));
