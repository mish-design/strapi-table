import styled from 'styled-components';

type ICellRoot = {
  $isEdit?: boolean;
};

export const CellRoot = styled.div.attrs<ICellRoot>((props) => ({
  $isEdit: props.$isEdit ?? false,
}))`
  position: relative;
  display: flex;
  flex-shrink: 0;
  width: 100%;
  max-width: 250px;
  padding: 8px 12px 36px;
  ${(props) => (props.$isEdit ? 'max-width: 500px;' : '')}
  border-right: 1px solid ${(props) => props.theme.colors.neutral200};

  transition: max-width 0.2s ease-out;

  &:last-child {
    border-right: none;
  }
`;

export const CellWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: calc(100% - 20px);
`;

export const CellBLock = styled.div`
  display: flex;
`;

export const CellBlockRender = styled.div`
  display: flex;
  flex-direction: column;

  gap: 4px;
`;

export const CellBlockTextInner = styled.div`
  .rich-text-editor {
    font-size: 13px;
  }

  /* 1. СТИЛИЗАЦИЯ ТУЛБАРА (ПАНЕЛИ ИНСТРУМЕНТОВ) */
  .rich-text-editor .ql-toolbar.ql-snow {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    background-color: ${({ theme }) => theme.colors.neutral150} !important;
    border: 1px solid ${({ theme }) => theme.colors.neutral200} !important;
  }

  /* Иконки Quill */
  .rich-text-editor .ql-toolbar .ql-stroke {
    stroke: ${({ theme }) => theme.colors.neutral600} !important;
    stroke-width: 2px;
    fill: none !important;
  }

  .rich-text-editor .ql-toolbar .ql-fill {
    fill: ${({ theme }) => theme.colors.neutral600} !important;
    stroke: none !important;
  }

  /* Текст выпадающего списка "Normal" на панели */
  .rich-text-editor .ql-toolbar .ql-picker {
    color: ${({ theme }) => theme.colors.neutral800} !important;
  }
  .rich-text-editor .ql-toolbar .ql-picker-label .ql-stroke {
    stroke: ${({ theme }) => theme.colors.neutral600} !important;
  }

  /* ======================================================== */
  /* ФИКС ДЛЯ ВЫПАДАЮЩЕГО СПИСКА (DROPDOWN OPTIONS)           */
  /* ======================================================== */
  .rich-text-editor .ql-toolbar .ql-picker-options {
    /* Фон выпадающего окна берем из темы (neutral100 или neutral0) */
    background-color: ${({ theme }) => theme.colors.neutral100} !important;
    border: 1px solid ${({ theme }) => theme.colors.neutral200} !important;
    border-radius: 4px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
    padding: 4px 0;
  }

  /* Текст элементов внутри выпадающего списка */
  .rich-text-editor .ql-toolbar .ql-picker-item {
    color: ${({ theme }) => theme.colors.neutral800} !important;
    padding: 4px 12px !important;
  }

  /* Эффект ховера на элементы списка */
  .rich-text-editor .ql-toolbar .ql-picker-item:hover,
  .rich-text-editor .ql-toolbar .ql-picker-item.ql-selected {
    background-color: ${({ theme }) => theme.colors.neutral150} !important;
    color: ${({ theme }) => theme.colors.primary600} !important;
  }
  /* ======================================================== */

  /* Подсветка кнопок при ховере */
  .rich-text-editor .ql-toolbar button:hover .ql-stroke,
  .rich-text-editor .ql-toolbar button:focus .ql-stroke,
  .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
    stroke: ${({ theme }) => theme.colors.primary600} !important;
  }
  .rich-text-editor .ql-toolbar button:hover .ql-fill,
  .rich-text-editor .ql-toolbar button:focus .ql-fill,
  .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
    fill: ${({ theme }) => theme.colors.primary600} !important;
  }

  /* 2. СТИЛИЗАЦИЯ КОНТЕЙНЕРА И ПОЛЯ ВВОДА */
  .rich-text-editor .ql-container.ql-snow {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    background-color: ${({ theme }) => theme.colors.neutral0} !important;
    color: ${({ theme }) => theme.colors.neutral800} !important;
    border: 1px solid ${({ theme }) => theme.colors.neutral200} !important;
    border-top: none !important;
  }

  .rich-text-editor .ql-editor {
    min-height: 80px;
    padding: 12px 16px;
  }

  .rich-text-editor .ql-editor.ql-blank::before {
    color: ${({ theme }) => theme.colors.neutral500} !important;
    font-style: normal;
    left: 16px;
  }

  /* 3. СОСТОЯНИЕ ФОКУСА ВСЕГО РЕДАКТОРА */
  .rich-text-editor :focus-within .ql-container,
  .rich-text-editor :focus-within .ql-toolbar {
    border-color: ${({ theme }) => theme.colors.primary600} !important;
  }
`;

export const CellBlockTextRender = styled.div`
  ul {
    list-style-type: disc !important;
    padding-left: 10px !important;
    margin: 4px 0 !important;
  }
  ol {
    list-style-type: decimal !important;
    padding-left: 10px !important;
    margin: 4px 0 !important;
  }
  li {
    display: list-item !important;
    margin-bottom: 2px;
  }
`;

export const CellBlocTextWrapper = styled.div`
  position: relative;

  &:hover ${'#delete-text'} {
    display: block;
  }
`;

export const CellBlockTextDelete = styled.div.attrs({ id: 'delete-text' })`
  position: absolute;
  top: 0;
  right: -20px;

  display: none;
`;

export const CellBlockImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const CellBlockImageWrapper = styled.div`
  max-width: 100px;
  width: 100%;

  border-radius: 4px;
  border: 1px solid #a8a8a8;

  overflow: hidden;

  position: relative;

  &:hover ${'#delete-block'} {
    display: block;
  }
`;

export const CellBlockImageDelete = styled.div.attrs({ id: 'delete-block' })`
  position: absolute;
  z-index: 5;
  top: 0px;
  right: 0px;

  display: none;
`;

type ICellDropdown = {
  $isVisible?: boolean;
};

export const CellDropdown = styled.div.attrs<ICellDropdown>((props) => ({
  $isVisible: props.$isVisible ?? false,
}))`
  position: absolute;
  z-index: 5;
  bottom: 4px;
  left: 4px;

  display: flex;
  gap: 2px;

  visibility: ${(props) => (props.$isVisible ? 'visible' : 'hidden')};
`;

export const CellButton = styled.button`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  background: transparent;

  cursor: pointer;
`;
