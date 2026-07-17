import styled from 'styled-components';

type ICellNumber = {
  $hasShadow: boolean;
};

export const CellNumber = styled.div.attrs<ICellNumber>((props) => ({
  $hasShadow: props.$hasShadow ?? false,
}))`
  min-width: 40px;
  min-height: 40px;
  position: sticky;
  left: 0;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${(props) => props.theme.colors.neutral150};

  border-right: 1px solid ${(props) => props.theme.colors.neutral200};
  box-shadow: ${(props) =>
    props.$hasShadow
      ? '4px 0 6px -1px rgba(0, 0, 0, 0.28), 2px 0 4px -1px rgba(0, 0, 0, 0.16)'
      : 'none'};
`;

type IRowTable = {
  $width: number;
  $isSelected: boolean;
};

export const RowTable = styled.div.attrs<IRowTable>(() => ({}))`
  display: flex;
  border-bottom: 1px solid ${(props) => props.theme.colors.neutral200};

  width: ${(props) => props.$width + 40}px;
  background: ${(props) => (props.$isSelected ? props.theme.colors.neutral150 : 'none')};

  transition: background 0.2s ease-out;

  &:last-child {
    border-bottom: none;
  }
`;
