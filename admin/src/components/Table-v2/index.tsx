import { Button, Flex } from '@strapi/design-system';
import { type Table as ITable, TableStoreProvider, createTableStore } from '../../hooks/useTable';
import { Header } from './Header/Header';
import {
  HorizontalSentinel,
  StyledTable,
  TableContentHorizontal,
  TableContentVertical,
  VerticalSentinel,
} from './index.style';
import { Row } from './Row/Row';
import { useIntersection } from '../../hooks/useIntersection';
import { useActiveStore } from '../../hooks/useActive';
import { useCallback, useEffect, useMemo } from 'react';
import { Plus } from '@strapi/icons';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';

type Props = {
  value?: ITable;
  onChange?: (value: ITable) => void;
};

const mockTable: ITable = {
  columns: [
    {
      id: 'col-1',
      header: 'Название товара',
      order: 1,
    },
    {
      id: 'col-2',
      header: 'Описание и характеристики',
      order: 2,
    },
  ],
  rows: [
    {
      id: 'row-1',
      cells: [
        {
          columnId: 'col-1',
          value: [],
        },
        {
          columnId: 'col-2',
          value: [],
        },
      ],
    },
    {
      id: 'row-2',
      cells: [
        {
          columnId: 'col-1',
          value: [],
        },
        {
          columnId: 'col-2',
          value: [],
        },
      ],
    },
  ],
};

export const Table = ({ onChange, value }: Readonly<Props>) => {
  const useInstanceTableStore = useMemo(() => createTableStore(value || mockTable), [value]);
  const { tableData, handleAddRow, handleAddColumn, setTableData, handleMoveRow, handleMoveColumn } =
    useInstanceTableStore();
  const { activeCell, activeTable } = useActiveStore();

  const topScroll = useIntersection();
  const leftScroll = useIntersection();

  const notifyChange = useCallback(
    (table: ITable) => {
      if (onChange) {
        onChange(table);
      }
    },
    [onChange]
  );

  const parsed: ITable | null = useMemo(() => {
    if (!value) return null;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error('Failed to parse propValue', e);
        return null;
      }
    }
    return value;
  }, [value]);

  useEffect(() => {
    if (!parsed) return;
    setTableData(parsed);
  }, [parsed, setTableData]);

  useEffect(() => {
    notifyChange(tableData);
  }, [tableData, notifyChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const rowIds = useMemo(() => tableData.rows.map((row) => row.id), [tableData.rows]);
  const columnIds = useMemo(
    () => tableData.columns.map((column) => column.id),
    [tableData.columns]
  );

  const handleRowDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      handleMoveRow(String(active.id), String(over.id));
    },
    [handleMoveRow]
  );

  const handleColumnDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      handleMoveColumn(String(active.id), String(over.id));
    },
    [handleMoveColumn]
  );

  return (
    <TableStoreProvider value={useInstanceTableStore}>
      <div>
        <Flex alignItems="center" style={{ justifyContent: 'flex-end' }} gap={2} marginBottom={4}>
          <Button variant="secondary" onClick={handleAddColumn} startIcon={<Plus />}>
            Добавить колонку
          </Button>
          <Button variant="secondary" onClick={handleAddRow} startIcon={<Plus />}>
            Добавить строку
          </Button>
        </Flex>
        <TableContentHorizontal
          width={
            activeCell ? 250 * (tableData.columns.length - 1) + 500 : 250 * tableData.columns.length
          }
          $isSelected={activeTable}
        >
          <HorizontalSentinel ref={leftScroll.sentinelRef} />

          <TableContentVertical>
            <VerticalSentinel ref={topScroll.sentinelRef} />

            <StyledTable>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
                onDragEnd={handleColumnDragEnd}
              >
                <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                  <Header columns={tableData.columns} $hasShadow={topScroll.isScrolled} />
                </SortableContext>
              </DndContext>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                onDragEnd={handleRowDragEnd}
              >
                <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                  <Row
                    rows={tableData.rows}
                    $hasLeftShadow={leftScroll.isScrolled}
                    columnsCount={tableData.columns.length}
                  />
                </SortableContext>
              </DndContext>
            </StyledTable>
          </TableContentVertical>
        </TableContentHorizontal>
      </div>
    </TableStoreProvider>
  );
};
