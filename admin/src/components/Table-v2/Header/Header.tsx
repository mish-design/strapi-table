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

type Props = {
  columns: Column[];
  $hasShadow: boolean;
};

type ColumnChoiceState = {
  colId: string;
  position: NonNullable<Column['icon']>['position'];
} | null;

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
    setTableData,
  } = useTableStore();

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
          <HeaderCell
            key={column.id}
            $isEdit={Boolean(activeCell && activeCell.colId === column.id)}
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
          </HeaderCell>
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
