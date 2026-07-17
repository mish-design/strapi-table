import { create } from 'zustand';

export type ActiveCell = {
  rowId: string;
  colId: string;
  blockId: string;
};

type ActiveCellState = {
  activeCell: null | ActiveCell;
  activeTable: boolean;
  setActiveCell: (cell: null | ActiveCell) => void;
  clearActiveCell: () => void;
  setActiveTable: (activeTable: boolean) => void;
};

export const useActiveStore = create<ActiveCellState>((set) => ({
  activeCell: null,
  activeTable: false,
  setActiveCell: (cell) => set({ activeCell: cell }),
  clearActiveCell: () => set({ activeCell: null }),
  setActiveTable: (activeTable) => set({ activeTable }),
}));
