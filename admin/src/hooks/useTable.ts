import { Modules } from '@strapi/strapi';
import { createContext, useContext } from 'react';
import { create, StoreApi, UseBoundStore } from 'zustand';

export type Image = {
  type: 'image';
  id: string;
  image: Modules.Documents.Result<'plugin::upload.file'> & {
    width: number;
    height: number;
    url: string;
  };
};

export type Text = {
  type: 'text';
  id: string;
  value: string;
};

export type Cell = Image | Text;

export type Row = {
  id: string;
  [columnId: string]: Cell[] | string;
};

export type Column = {
  id: string;
  header: string;
  icon?: {
    position: 'left' | 'right';
  } & Modules.Documents.Result<'plugin::upload.file'> & {
      width: number;
      height: number;
      url: string;
    };
};

export type Table = {
  columns: Column[];
  rows: Row[];
};

type TableState = {
  tableData: Table;

  setTableData: (data: Table) => void;
  handleChangeBlock: (
    colId: string,
    rowId: string,
    blockId: string,
    newValue: Text['value'] | Image['image']
  ) => void;
  handleAddEntityInBlock: (
    colId: string,
    rowId: string,
    type: 'text' | 'image',
    value: Text['value'] | Image['image']
  ) => void;
  handleRemoveEntityInBlock: (colId: string, rowId: string, blockId: string) => void;
  handleAddRow: () => void;
  handleRemoveRow: (id: string) => void;
  handleClearRow: (id: string) => void;
  handleAddColumn: () => void;
  handleRemoveColumn: (colId: string) => void;
  handleChangeNameHeader: (colId: string, value: string) => void;
  handleAddIconInHeader: (colId: string, value: Column['icon']) => void;
  handleRemoveIconFromHeader: (colId: string) => void;
};

export const createTableStore = (initData: Table): UseBoundStore<StoreApi<TableState>> => {
  return create<TableState>((set) => ({
    tableData: initData,

    setTableData: (data) => set({ tableData: data }),

    handleChangeBlock: (colId, rowId, blockId, newValue) =>
      set((state) => {
        const newData = state.tableData.rows.map<Row>((item) => {
          if (item.id !== rowId) return item;
          const column = item[colId];
          if (!column || typeof column === 'string') return item;

          return {
            ...item,
            [colId]: column.map((i) => {
              if (i.id !== blockId) return i;
              if (i.type === 'text' && typeof newValue === 'string') {
                return { ...i, value: newValue };
              }
              if (i.type === 'image' && typeof newValue === 'object' && newValue !== null) {
                return { ...i, image: newValue };
              }
              return i;
            }),
          };
        });

        return { tableData: { ...state.tableData, rows: newData } };
      }),

    handleAddEntityInBlock: (colId, rowId, type, value) =>
      set((state) => {
        const newData = state.tableData.rows.map<Row>((item) => {
          if (item.id !== rowId) return item;

          const column = item[colId];
          if (!column || typeof column === 'string') return item;

          if (type === 'text' && typeof value === 'string') {
            return {
              ...item,
              [colId]: column.concat([
                { id: `block_${String(window.crypto.randomUUID())}`, type: 'text', value },
              ]),
            };
          }

          if (type === 'image' && typeof value === 'object' && value !== null) {
            return {
              ...item,
              [colId]: column.concat([
                { id: `block_${String(window.crypto.randomUUID())}`, type: 'image', image: value },
              ]),
            };
          }

          return item;
        });

        return { tableData: { ...state.tableData, rows: newData } };
      }),

    handleRemoveEntityInBlock: (colId, rowId, blockId) =>
      set((state) => {
        const newData = state.tableData.rows.map<Row>((item) => {
          if (item.id !== rowId) return item;
          const column = item[colId];
          if (!column || typeof column === 'string') return item;

          return {
            ...item,
            [colId]: column.filter((c) => c.id !== blockId),
          };
        });

        return { tableData: { ...state.tableData, rows: newData } };
      }),

    handleAddRow: () =>
      set((state) => {
        const newRowId = `row_${String(window.crypto.randomUUID())}`;
        const newRow: Row = { id: newRowId };

        state.tableData.columns.forEach((col) => {
          newRow[col.id] = [];
        });

        return {
          tableData: {
            ...state.tableData,
            rows: state.tableData.rows.concat(newRow),
          },
        };
      }),

    handleRemoveRow: (id) =>
      set((state) => {
        const newRows = state.tableData.rows.filter((row) => row.id !== id);

        return { tableData: { ...state.tableData, rows: newRows } };
      }),

    handleClearRow: (id) =>
      set((state) => {
        return {
          tableData: {
            ...state.tableData,
            rows: state.tableData.rows.map((row) => {
              if (row.id !== id) return row;
              const newRow = Object.keys(row)
                .filter((key) => key !== 'id')
                .reduce<Map<string, Row[]>>((prev, key) => prev.set(key, []), new Map());

              return { id: row.id, ...Object.fromEntries(newRow) };
            }),
          },
        };
      }),

    handleAddColumn: () =>
      set((state) => {
        const newColId = `col_${String(window.crypto.randomUUID())}`;
        const newColumns = state.tableData.columns.concat({
          id: newColId,
          header: 'Новая колонка',
        });
        const newRows = state.tableData.rows.map((row) => ({ ...row, [newColId]: [] }));

        return { tableData: { columns: newColumns, rows: newRows } };
      }),

    handleRemoveColumn: (colId) =>
      set((state) => {
        const newColumns = state.tableData.columns.filter((item) => item.id !== colId);
        const newRows = state.tableData.rows.map<Row>((row) => {
          const newRow = { ...row };
          delete newRow[colId];
          return newRow;
        });

        return { tableData: { columns: newColumns, rows: newRows } };
      }),

    handleChangeNameHeader: (colId, value) =>
      set((state) => {
        const newColumns = state.tableData.columns.map((column) => {
          if (column.id !== colId) return column;
          return { ...column, header: value };
        });

        return { tableData: { ...state.tableData, columns: newColumns } };
      }),

    handleAddIconInHeader: (colId, value) =>
      set((state) => {
        const newColumns = state.tableData.columns.map((column) => {
          if (column.id !== colId) return column;
          return { ...column, icon: value };
        });

        return { tableData: { ...state.tableData, columns: newColumns } };
      }),

    handleRemoveIconFromHeader: (colId) =>
      set((state) => {
        const newColumns = state.tableData.columns.map((column) => {
          if (column.id !== colId) return column;
          const { icon, ...rest } = column;
          return rest;
        });

        return { tableData: { ...state.tableData, columns: newColumns } };
      }),
  }));
};

const TableStoreContext = createContext<UseBoundStore<StoreApi<TableState>> | undefined>(undefined);
export const TableStoreProvider = TableStoreContext.Provider;

export const useTableStore = () => {
  const store = useContext(TableStoreContext);
  if (!store) {
    throw new Error('useTableStore must be used within a TableStoreProvider.');
  }

  return store();
};
