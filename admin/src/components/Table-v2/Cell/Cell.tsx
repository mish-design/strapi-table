import {
  CellBlockImage,
  CellBlockImageDelete,
  CellBlockImageWrapper,
  CellBlockTextInner,
  CellBlockTextRender,
  CellDropdown,
  CellButton,
  CellRoot,
  CellWrapper,
  CellBlocTextWrapper,
  CellBlockTextDelete,
} from './Cell.style';
import { Fragment } from 'react/jsx-runtime';
import { useMemo, useState } from 'react';
import { useStrapiApp } from '@strapi/strapi/admin';
import { Typography } from '@strapi/design-system';
import { type Cell as ICell, type Image, useTableStore } from '../../../hooks/useTable';
import { ActiveCell, useActiveStore } from '../../../hooks/useActive';
import { Cross, Image as ImageIcon, Pencil } from '@strapi/icons';
import { Editor } from '../Editor/Editor';
import sanitizeHtml from 'sanitize-html';

type Props = {
  rowId: string;
  colId: string;
  value: ICell[];
};

export const Cell = ({ colId, rowId, value }: Readonly<Props>) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isHover, setIsHover] = useState<boolean>(false);
  const [isNewTextBlockItem, setIsNewTextBlockItem] = useState<boolean>(false);
  const [replaceImage, setReplaceImage] = useState<ActiveCell | null>(null);
  const { activeCell, setActiveCell } = useActiveStore();
  const { handleAddEntityInBlock, handleChangeBlock, handleRemoveEntityInBlock } = useTableStore();

  const components = useStrapiApp('MediaPicker', (state) => state.components);
  const MediaLibrary = components['media-library'] as any;

  const cleanHtml = (value: string) => {
    return sanitizeHtml(value, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'span']),

      allowedAttributes: {
        a: ['href', 'name', 'target', 'rel'],
        span: ['style', 'class'],
        p: ['style', 'class'],
        '*': ['class'],
      },
    });
  };

  return (
    <CellRoot
      $isEdit={Boolean(activeCell && activeCell.colId === colId)}
      onMouseOver={() => setIsHover(true)}
      onMouseOut={() => {
        setIsHover(false);
      }}
    >
      <CellWrapper>
        {value.map((item, idx) => (
          <Fragment key={item.id}>
            {idx > 0 && null}
            {(() => {
              if (
                activeCell &&
                activeCell.blockId === item.id &&
                activeCell.colId === colId &&
                activeCell.rowId === rowId &&
                item.type === 'text'
              ) {
                return (
                  <CellBlockTextInner>
                    <Editor
                      value={item.value}
                      onCancel={() => setActiveCell(null)}
                      onSave={(value) => {
                        setActiveCell(null);
                        if (value.trim() === '') {
                          return handleRemoveEntityInBlock(colId, rowId, item.id);
                        }
                        handleChangeBlock(colId, rowId, item.id, value);
                      }}
                    />
                  </CellBlockTextInner>
                );
              }

              return (
                <>
                  {item.type === 'text' && (
                    <CellBlocTextWrapper>
                      <Typography
                        variant="pi"
                        fontWeight="normal"
                        onClick={() => {
                          if (isNewTextBlockItem) setIsNewTextBlockItem(false);
                          setActiveCell({ blockId: item.id, colId, rowId });
                        }}
                      >
                        <CellBlockTextRender
                          dangerouslySetInnerHTML={{ __html: cleanHtml(item.value) }}
                        />
                      </Typography>
                      <CellBlockTextDelete>
                        <CellButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveEntityInBlock(colId, rowId, item.id);
                          }}
                        >
                          <Cross
                            style={{
                              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8)',
                              fill: 'white',
                            }}
                          />
                        </CellButton>
                      </CellBlockTextDelete>
                    </CellBlocTextWrapper>
                  )}
                  {item.type === 'image' && (
                    <CellBlockImageWrapper
                      onClick={() => {
                        setReplaceImage({ blockId: item.id, colId, rowId });
                        setOpenModal(true);
                      }}
                    >
                      <CellBlockImage alt="table image" src={item.image.url} />
                      <CellBlockImageDelete>
                        <CellButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveEntityInBlock(colId, rowId, item.id);
                          }}
                        >
                          <Cross
                            style={{
                              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8)',
                              fill: 'white',
                            }}
                          />
                        </CellButton>
                      </CellBlockImageDelete>
                    </CellBlockImageWrapper>
                  )}
                </>
              );
            })()}
          </Fragment>
        ))}
        {isNewTextBlockItem && (
          <CellBlockTextInner>
            <Editor
              value=""
              onCancel={() => {
                setIsNewTextBlockItem(false);
                setActiveCell(null);
              }}
              onSave={(value) => {
                if (value.trim() !== '') {
                  handleAddEntityInBlock(colId, rowId, 'text', value);
                }
                setActiveCell(null);
                setIsNewTextBlockItem(false);
              }}
            />
          </CellBlockTextInner>
        )}
      </CellWrapper>
      <CellDropdown $isVisible={isHover}>
        <CellButton
          onClick={() => {
            setIsNewTextBlockItem(true);
            setActiveCell({ colId, rowId, blockId: 'block_new_text' });
          }}
        >
          <Pencil fill="neutral500" />
        </CellButton>
        <CellButton onClick={() => setOpenModal(true)}>
          <ImageIcon fill="neutral500" />
        </CellButton>
      </CellDropdown>
      {openModal && (
        <MediaLibrary
          onClose={() => setOpenModal(false)}
          onSelectAssets={(image: Image['image'][]) => {
            setOpenModal(false);
            setIsHover(false);
            if (replaceImage) {
              setReplaceImage(null);
              return handleChangeBlock(colId, rowId, replaceImage.blockId, image[0]);
            }

            return handleAddEntityInBlock(colId, rowId, 'image', image[0]);
          }}
          allowedTypes={['images']}
          multiple={false}
        />
      )}
    </CellRoot>
  );
};
