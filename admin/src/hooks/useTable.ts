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
  cells: { columnId: string; value: Cell[] }[];
};

export type Column = {
  id: string;
  header: string;
  order: number;
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
  const isWithOrder = initData.columns.every((column) => typeof column.order === 'number');
  const newInitData = isWithOrder
    ? {
        ...initData,
        columns: initData.columns.map((column, idx) => ({ ...column, order: idx + 1 })),
      }
    : initData;

  return create<TableState>((set) => ({
    tableData: newInitData,

    setTableData: (data) => set({ tableData: data }),

    handleChangeBlock: (colId, rowId, blockId, newValue) =>
      set((state) => {
        const newData = state.tableData.rows.map<Row>((item) => {
          if (item.id !== rowId) return item;
          const column = item.cells.find((cell) => cell.columnId === colId);
          if (!column || typeof column === 'string') return item;

          return {
            ...item,
            cells: item.cells.map((cell) => {
              if (cell.columnId != colId) return cell;

              return {
                ...cell,
                value: cell.value.map((block) => {
                  if (block.id !== blockId) return block;
                  if (block.type === 'text' && typeof newValue === 'string')
                    return { ...block, value: newValue };
                  if (block.type === 'image' && typeof newValue === 'object' && newValue !== null)
                    return { ...block, image: newValue };
                  return block;
                }),
              };
            }),
          };
        });

        return { tableData: { ...state.tableData, rows: newData } };
      }),

    handleAddEntityInBlock: (colId, rowId, type, value) =>
      set((state) => {
        const newData = state.tableData.rows.map<Row>((item) => {
          if (item.id !== rowId) return item;
          if (type === 'text' && typeof value === 'string') {
            return {
              ...item,
              cells: item.cells.map((cell) => {
                if (cell.columnId !== colId) return cell;
                const newBlock: Text = {
                  id: `block_${String(window.crypto.randomUUID())}`,
                  type: 'text',
                  value,
                };

                return { ...cell, value: cell.value.concat(newBlock) };
              }),
            };
          }
          if (type === 'image' && typeof value === 'object' && value !== null) {
            return {
              ...item,
              cells: item.cells.map((cell) => {
                if (cell.columnId !== colId) return cell;
                const newBlock: Image = {
                  id: `block_${String(window.crypto.randomUUID())}`,
                  type: 'image',
                  image: value,
                };
                return { ...cell, value: cell.value.concat(newBlock) };
              }),
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
          return {
            ...item,
            cells: item.cells.map((cell) => {
              if (cell.columnId !== colId) return cell;
              return { ...cell, value: cell.value.filter((block) => block.id !== blockId) };
            }),
          };
        });

        return { tableData: { ...state.tableData, rows: newData } };
      }),

    handleAddRow: () =>
      set((state) => {
        const newRowId = `row_${String(window.crypto.randomUUID())}`;
        const newRow: Row = { id: newRowId, cells: [] };

        state.tableData.columns.forEach((col) => {
          newRow.cells.push({ columnId: col.id, value: [] });
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

              return { id: row.id, cells: row.cells.map((cell) => ({ ...cell, value: [] })) };
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
          order: state.tableData.columns.length,
        });
        const newRows = state.tableData.rows.map((row) => ({
          ...row,
          cells: row.cells.concat({ columnId: newColId, value: [] }),
        }));

        return { tableData: { columns: newColumns, rows: newRows } };
      }),

    handleRemoveColumn: (colId) =>
      set((state) => {
        const newColumns = state.tableData.columns.filter((item) => item.id !== colId);
        const newRows = state.tableData.rows.map<Row>((row) => {
          return { ...row, cells: row.cells.filter((cell) => cell.columnId != colId) };
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
