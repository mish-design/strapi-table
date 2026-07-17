import styled from 'styled-components';

type ITableContentHorizontal = {
  width: number;
  $isSelected: boolean;
};

export const TableContentHorizontal = styled.div.attrs<ITableContentHorizontal>(() => ({}))`
  margin-top: 24px;
  border: 1px solid ${(props) => props.theme.colors.neutral200};
  border-radius: 4px;
  position: relative;

  overflow-x: auto;
  overflow-y: hidden;
  width: ${(props) => props.width + 42}px;
  max-width: 100%;

  background: ${(props) => (props.$isSelected ? props.theme.colors.neutral150 : 'none')};

  transition width 0.2s ease-out;
`;

export const TableContentVertical = styled.div`
  max-height: 600px;
  overflow-y: auto;
  overflow-x: auto;
`;

export const StyledTable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 100%;
`;

export const HorizontalSentinel = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 100%;
  pointer-events: none;
`;

export const VerticalSentinel = styled.div`
  width: 100%;
  height: 1px;
  pointer-events: none;
`;
