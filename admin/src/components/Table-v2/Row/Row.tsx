import { Typography } from '@strapi/design-system';
import { useTableStore, type Row as IRow } from '../../../hooks/useTable';
import { Cell } from '../Cell/Cell';
import { CellNumber, RowTable } from './Row.style';
import { useActiveStore } from '../../../hooks/useActive';
import { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Props = {
  rows: IRow[];
  $hasLeftShadow: boolean;
  columnsCount: number;
};

type SortableRowProps = {
  row: IRow;
  idx: number;
  width: number;
  isSelected: boolean;
  $hasLeftShadow: boolean;
  onCellNumberClick: (id: string) => void;
};

const SortableRow = ({
  row,
  idx,
  width,
  isSelected,
  $hasLeftShadow,
  onCellNumberClick,
}: Readonly<SortableRowProps>) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });

  return (
    <RowTable
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 6 : undefined,
        position: 'relative',
      }}
      $width={width}
      $isSelected={isSelected}
    >
      <CellNumber
        $hasShadow={$hasLeftShadow}
        onClick={() => onCellNumberClick(row.id)}
        data-cell-number="true"
        style={{ cursor: 'grab', touchAction: 'none' }}
        {...attributes}
        {...listeners}
      >
        <Typography tag="h5">{idx + 1}</Typography>
      </CellNumber>

      {row.cells.map((cell) => {
        return <Cell colId={cell.columnId} rowId={row.id} value={cell.value} key={cell.columnId} />;
      })}
    </RowTable>
  );
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
      {rows.map((row, idx) => (
        <SortableRow
          key={row.id}
          row={row}
          idx={idx}
          width={activeCell ? 250 * (columnsCount - 1) + 500 : 250 * columnsCount}
          isSelected={row.id === selectedRowIdx}
          $hasLeftShadow={$hasLeftShadow}
          onCellNumberClick={handleCellClick}
        />
      ))}
    </>
  );
};
