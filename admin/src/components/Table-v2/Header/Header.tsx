import { Column, Image, useTableStore } from '../../../hooks/useTable';
import {
  HeaderCell,
  HeaderCellImage,
  HeaderCellImageWrapper,
  HeaderCellInner,
  HeaderCellTypography,
  HeaderEmptyCell,
  HeaderRoot,
} from './Header.style';
import { Flex, Menu, Typography, Field } from '@strapi/design-system';
import { useActiveStore } from '../../../hooks/useActive';
import { BulletList, Cross, Image as ImageIcon } from '@strapi/icons';
import { useStrapiApp } from '@strapi/strapi/admin';
import { useState, useEffect, useRef } from 'react';
import { usePast } from '../../../hooks/usePast';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Props = {
  columns: Column[];
  $hasShadow: boolean;
};

type ColumnChoiceState = {
  colId: string;
  position: NonNullable<Column['icon']>['position'];
} | null;

type SortableHeaderCellProps = {
  columnId: string;
  $isEdit: boolean;
  isSelected: boolean;
  onHandleClick: (id: string) => void;
  children: React.ReactNode;
};

const SortableHeaderCell = ({
  columnId,
  $isEdit,
  isSelected,
  onHandleClick,
  children,
}: Readonly<SortableHeaderCellProps>) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: columnId,
  });

  return (
    <HeaderCell
      ref={setNodeRef}
      data-column-handle="true"
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 11 : undefined,
        position: 'relative',
        outline: isSelected ? '2px solid #4945ff' : 'none',
        outlineOffset: '-2px',
        cursor: 'grab',
        touchAction: 'none',
      }}
      $isEdit={$isEdit}
      onClick={(e: React.MouseEvent) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;
        // Не выделяем колонку при клике по интерактивным элементам (название, меню, инпут)
        if (target.closest('h4, input, button, [role="menu"], [role="menuitem"]')) return;
        onHandleClick(columnId);
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </HeaderCell>
  );
};

export const Header = ({ columns, $hasShadow }: Readonly<Props>) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [changeHeader, setChangeHeader] = useState<string>('');
  const [choiceColumn, setChoiceColumn] = useState<ColumnChoiceState>();

  const { activeCell, setActiveCell, clearActiveCell, setActiveTable, activeTable } =
    useActiveStore();
  const {
    handleRemoveIconFromHeader,
    handleRemoveColumn,
    handleAddIconInHeader,
    handleChangeNameHeader,
    handleClearColumn,
    handleClearTable,
    setTableData,
  } = useTableStore();

  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedColumnId === null) return;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.code.toUpperCase() === 'BACKSPACE' && selectedColumnId) {
        handleClearColumn(selectedColumnId);
        setSelectedColumnId(null);
      }
      if (event.code.toUpperCase() === 'DELETE' && selectedColumnId) {
        handleRemoveColumn(selectedColumnId);
        setSelectedColumnId(null);
      }
      if (event.code.toUpperCase() === 'ESCAPE') {
        setSelectedColumnId(null);
      }
    };

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const clickedOnColumnHandle = target.closest('[data-column-handle="true"]');

      if (!clickedOnColumnHandle) {
        setSelectedColumnId(null);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('mousedown', handleOutsideClick);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [selectedColumnId, handleClearColumn, handleRemoveColumn]);

  useEffect(() => {
    if (!activeTable) return;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.code.toUpperCase() === 'BACKSPACE') {
        handleClearTable();
        setActiveTable(false);
      }
      if (event.code.toUpperCase() === 'ESCAPE') {
        setActiveTable(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [activeTable, handleClearTable, setActiveTable]);

  const { getPastData } = usePast();
  const emptyCellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const clickedInsideHeader = target.closest('[data-table-header="true"]');
      const clickedInsideMenuOrModal =
        target.closest('[data-strapi-portal="true"]') || target.closest('[role="menu"]');

      if (!clickedInsideHeader && !clickedInsideMenuOrModal) {
        setActiveTable(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [setActiveTable]);

  useEffect(() => {
    if (activeTable && emptyCellRef.current) {
      emptyCellRef.current.focus();
    }
  }, [activeTable]);

  const handleLoadIcon = (position: NonNullable<Column['icon']>['position'], colId: string) => {
    setChoiceColumn({
      colId,
      position,
    });
    setOpenModal(true);
  };

  const handleUploadImage = (image: Image['image'][]) => {
    if (!choiceColumn) {
      setOpenModal(false);
      return;
    }
    handleAddIconInHeader(choiceColumn.colId, { position: choiceColumn.position, ...image[0] });
    setOpenModal(false);
    setChoiceColumn(null);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!activeTable) return;
    e.preventDefault();

    let pasteText = e.clipboardData.getData('text/html');
    if (!pasteText) {
      pasteText = e.clipboardData.getData('text/plain');
    }

    if (pasteText) {
      const parsedTable = getPastData(pasteText);
      if (parsedTable && typeof setTableData === 'function') {
        setTableData(parsedTable);
      }
    }
  };

  const components = useStrapiApp('MediaPicker', (state) => state.components);
  const MediaLibrary = components['media-library'] as any;

  return (
    <HeaderRoot
      $hasShadow={$hasShadow}
      $width={activeCell ? 250 * (columns.length - 1) + 500 : 250 * columns.length}
    >
      <HeaderEmptyCell
        ref={emptyCellRef}
        tabIndex={0}
        data-table-header="true"
        onPaste={handlePaste}
        onClick={(e) => {
          e.stopPropagation();
          setActiveTable(true);
        }}
      />
      {columns.map((column) => {
        return (
          <SortableHeaderCell
            key={column.id}
            columnId={column.id}
            $isEdit={Boolean(activeCell && activeCell.colId === column.id)}
            isSelected={column.id === selectedColumnId}
            onHandleClick={setSelectedColumnId}
          >
            {activeCell?.colId === column.id &&
            activeCell.rowId === 'row_header' &&
            activeCell.blockId === 'block_header' ? (
              <Field.Input
                autoFocus
                style={{ width: 'calc(500px - 24px)', background: 'transparent' }}
                value={changeHeader}
                onChange={(e) => setChangeHeader(e.target.value)}
                onBlur={() => {
                  handleChangeNameHeader(column.id, changeHeader ? changeHeader : 'Новая колонка');
                  setChangeHeader('');
                  clearActiveCell();
                }}
              />
            ) : (
              <>
                <HeaderCellInner $isReverse={Boolean(column.icon?.position === 'right')}>
                  {column.icon && (
                    <HeaderCellImageWrapper>
                      <HeaderCellImage
                        alt={`header image ${column.icon.documentId}`}
                        src={column.icon.url}
                      />
                    </HeaderCellImageWrapper>
                  )}
                  <HeaderCellTypography>
                    <Typography
                      fontWeight="semiBold"
                      fontSize="16px"
                      tag="h4"
                      onClick={() => {
                        setActiveCell({
                          blockId: 'block_header',
                          colId: column.id,
                          rowId: 'row_header',
                        });
                        setChangeHeader(column.header);
                      }}
                    >
                      {column.header}
                    </Typography>
                  </HeaderCellTypography>
                </HeaderCellInner>
                <div>
                  <Menu.Root>
                    <Menu.Trigger style={{ paddingInline: '0px', height: 'auto', border: 'none' }}>
                      <BulletList width={16} height={16} />
                    </Menu.Trigger>
                    <Menu.Content>
                      <Menu.Item onClick={() => handleLoadIcon('left', column.id)}>
                        <Flex alignItems="center" gap={2}>
                          <ImageIcon />
                          <Typography>Иконка слева</Typography>
                        </Flex>
                      </Menu.Item>
                      <Menu.Item onClick={() => handleLoadIcon('right', column.id)}>
                        <Flex alignItems="center" gap={2}>
                          <ImageIcon />
                          <Typography>Иконка справа</Typography>
                        </Flex>
                      </Menu.Item>
                      {column.icon && (
                        <Menu.Item onClick={() => handleRemoveIconFromHeader(column.id)}>
                          <Flex alignItems="center" gap={2}>
                            <Cross />
                            <Typography>Удалить иконку</Typography>
                          </Flex>
                        </Menu.Item>
                      )}
                      {columns.length > 1 && (
                        <Menu.Item onClick={() => handleRemoveColumn(column.id)}>
                          <Flex alignItems="center" gap={2}>
                            <Cross />
                            <Typography>Удалить колонку</Typography>
                          </Flex>
                        </Menu.Item>
                      )}
                    </Menu.Content>
                  </Menu.Root>
                </div>
              </>
            )}
          </SortableHeaderCell>
        );
      })}

      {openModal && (
        <MediaLibrary
          onClose={() => setOpenModal(false)}
          onSelectAssets={handleUploadImage}
          allowedTypes={['images']}
          multiple={false}
        />
      )}
    </HeaderRoot>
  );
};
