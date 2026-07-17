import styled from 'styled-components';

type IHeaderRoot = {
  $hasShadow: boolean;
  $width: number;
};

export const HeaderRoot = styled.div.attrs<IHeaderRoot>((props) => ({
  $hasShadow: props.$hasShadow ?? false,
}))`
  display: flex;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: ${(props) => props.theme.colors.neutral100};
  border-bottom: 1px solid ${(props) => props.theme.colors.neutral200};
  width: ${(props) => props.$width + 40}px;

  box-shadow: ${(props) =>
    props.$hasShadow
      ? '4px 0 6px -1px rgba(0, 0, 0, 0.28), 2px 0 4px -1px rgba(0, 0, 0, 0.16)'
      : 'none'};
`;

export const HeaderEmptyCell = styled.div`
  display: flex;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  left: 0;
  width: 40px;
  min-height: 40px;

  background-color: ${(props) => props.theme.colors.neutral100};

  border-right: 1px solid ${(props) => props.theme.colors.neutral200};
`;

type IHeaderCell = {
  $hasEmpty?: boolean;
  $isEdit?: boolean;
};

export const HeaderCell = styled.div.attrs<IHeaderCell>((props) => ({
  $isEdit: props.$isEdit ?? false,
}))`
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  width: 100%;
  max-width: 250px;
  padding: 8px 12px;
  ${(props) => (props.$isEdit ? 'max-width: 500px;' : '')}
  border-right: 1px solid ${(props) => props.theme.colors.neutral200};

  transition: max-width 0.2s ease-out;

  &:last-child {
    border-right: none;
  }
`;

type IHeaderCellInner = {
  $isReverse: boolean;
};

export const HeaderCellInner = styled.div.attrs<IHeaderCellInner>((props) => ({
  $isReverse: props.$isReverse ?? false,
}))`
  display: flex;
  gap: 8px;
  width: calc(100% - 44px);
  flex-direction: ${(props) => (props.$isReverse ? 'row-reverse' : 'row')};
`;

export const HeaderCellImageWrapper = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 2px;
  overflow: hidden;
`;

export const HeaderCellImage = styled.img`
  display: block;
  width: 16px;
  height: 16px;
`;

export const HeaderCellTypography = styled.div`
  width: calc(100% - 24px);
`;
