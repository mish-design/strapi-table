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
      'col-1': [],
      'col-2': [],
    },
    {
      id: 'row-2',
      'col-1': [],
      'col-2': [],
    },
  ],
};

export const Table = ({ onChange, value }: Readonly<Props>) => {
  const useInstanceTableStore = useMemo(() => createTableStore(value || mockTable), [value]);
  const { tableData, handleAddRow, handleAddColumn, setTableData } = useInstanceTableStore();
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
              <Header columns={tableData.columns} $hasShadow={topScroll.isScrolled} />
              <Row
                rows={tableData.rows}
                $hasLeftShadow={leftScroll.isScrolled}
                columnsCount={tableData.columns.length}
              />
            </StyledTable>
          </TableContentVertical>
        </TableContentHorizontal>
      </div>
    </TableStoreProvider>
  );
};
