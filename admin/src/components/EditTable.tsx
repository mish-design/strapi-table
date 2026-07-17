import React, { forwardRef, memo } from 'react';
import { Table } from './Table-v2';
import { Box } from '@strapi/design-system';
import { Table as ITable } from 'src/hooks/useTable';

type Props = {
  name?: string;
  attribute?: {
    name?: string;
    value?: ITable;
    pluginOptions?: {
      i18n?: {
        localized?: boolean;
      };
    };
  };
  value?: ITable;
  onChange?: (e: any) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  hint?: string;
  label?: string;
  required?: boolean;
  labelAction?: React.ReactNode;
};

const EditTable = forwardRef<any, Readonly<Props>>((props, ref) => {
  const name = props?.name || props?.attribute?.name || 'data';
  const value = props?.attribute?.value ?? props?.value;
  const onChange = props?.onChange;

  const handleChange = (newValue: ITable) => {
    if (onChange) {
      onChange({ target: { name, value: newValue } });
    }
  };

  return (
    <Box padding={4}>
      <Table onChange={handleChange} value={value} />
    </Box>
  );
});

function areEqual(prev: Props, next: Props): boolean {
  const prevValue = prev?.attribute?.value ?? prev?.value;
  const nextValue = next?.attribute?.value ?? next?.value;

  if (!prevValue && !nextValue) return true;
  if (!prevValue || !nextValue) return false;

  return JSON.stringify(prevValue) === JSON.stringify(nextValue);
}

export const Field = memo(EditTable, areEqual);
