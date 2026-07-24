import { Typography } from '@strapi/design-system';
import { useTableStore, type Row as IRow } from '../../../hooks/useTable';
import { Cell } from '../Cell/Cell';
import { CellNumber, RowTable } from './Row.style';
import { useActiveStore } from '../../../hooks/useActive';
import { useEffect, useState } from 'react';

type Props = {
  rows: IRow[];
  $hasLeftShadow: boolean;
  columnsCount: number;
};

export const Row = ({ rows, $hasLeftShadow, columnsCount }: Readonly<Props>) => {
  const { activeCell } = useActiveStore();
  const { handleRemoveRow, handleClearRow } = useTableStore();
  const [selectedRowIdx, setSelectedRowIdx] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRowIdx === null) return;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.code.toUpperCase() === 'BACKSPACE' && selectedRowIdx) {
        handleClearRow(selectedRowIdx);
        setSelectedRowIdx(null);
      }
      if (event.code.toUpperCase() === 'DELETE' && selectedRowIdx) {
        handleRemoveRow(selectedRowIdx);
      }
      if (event.code.toUpperCase() === 'ESCAPE') {
        setSelectedRowIdx(null);
      }
    };

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const clickedOnCellNumber = target.closest('[data-cell-number="true"]');

      if (!clickedOnCellNumber) {
        setSelectedRowIdx(null);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('mousedown', handleOutsideClick);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [selectedRowIdx]);

  const handleCellClick = (id: string) => {
    setSelectedRowIdx(id);
  };

  return (
    <>
      {rows.map((row, idx) => {
        const { id, cells } = row;
        return (
          <RowTable
            key={id}
            $width={activeCell ? 250 * (columnsCount - 1) + 500 : 250 * columnsCount}
            $isSelected={row.id === selectedRowIdx}
          >
            <CellNumber
              $hasShadow={$hasLeftShadow}
              onClick={() => handleCellClick(row.id)}
              data-cell-number="true"
            >
              <Typography tag="h5">{idx + 1}</Typography>
            </CellNumber>

            {cells.map((cell) => {
              return (
                <Cell colId={cell.columnId} rowId={id} value={cell.value} key={cell.columnId} />
              );
            })}
          </RowTable>
        );
      })}
    </>
  );
};
