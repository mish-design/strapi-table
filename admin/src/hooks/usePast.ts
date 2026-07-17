import { create } from 'zustand';
import { Table, Column, Row } from './useTable';

type Action = {
  getPastData: (text: string) => Table;
};

export const usePast = create<Action>(() => ({
  getPastData: (text) => {
    let rawRows: string[][] = [];

    if (text.includes('<table') || text.includes('<tr')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const trElements = doc.querySelectorAll('tr');

      trElements.forEach((tr) => {
        const cells: string[] = [];
        const tdElements = tr.querySelectorAll('td, th');
        tdElements.forEach((td) => {
          cells.push(td.textContent?.trim() || '');
        });
        if (cells.length > 0) {
          rawRows.push(cells);
        }
      });
    }

    if (rawRows.length === 0) {
      const lines = text.split(/\r?\n/);
      lines.forEach((line) => {
        if (line.trim() !== '') {
          rawRows.push(line.split('\t').map((cell) => cell.trim()));
        }
      });
    }

    if (rawRows.length === 0) {
      return { columns: [], rows: [] };
    }

    rawRows = rawRows
      .map((row) => {
        let lastNonEmptyIndex = row.length - 1;
        while (lastNonEmptyIndex >= 0 && row[lastNonEmptyIndex] === '') {
          lastNonEmptyIndex--;
        }

        return row.slice(0, lastNonEmptyIndex + 1);
      })
      .filter((row) => row.length > 0);

    if (rawRows.length === 0) {
      return { columns: [], rows: [] };
    }

    const maxColumnsCount = Math.max(...rawRows.map((row) => row.length));

    const columns: Column[] = Array.from({ length: maxColumnsCount }).map(() => ({
      id: `col_${window.crypto.randomUUID()}`,
      header: 'Новая колонка',
    }));

    const rows: Row[] = rawRows.map((rawRow) => {
      const rowId = `row_${window.crypto.randomUUID()}`;
      const rowData: Row = { id: rowId };

      columns.forEach((col, colIndex) => {
        const rawValue = rawRow[colIndex] || '';
        const wrappedValue = `<p>${rawValue}</p>`;

        rowData[col.id] = [
          {
            id: `block_${window.crypto.randomUUID()}`,
            type: 'text',
            value: wrappedValue,
          },
        ];
      });

      return rowData;
    });

    return {
      columns,
      rows,
    };
  },
}));
