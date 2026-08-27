import { Box, Button, Flex } from '@strapi/design-system';
import { useState } from 'react';
import ReactQuill from 'react-quill-new';

import 'react-quill-new/dist/quill.snow.css';

type Props = {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
};

const normalizeSpaces = (html: string) => html.replace(/\u00A0/g, ' ').replace(/&nbsp;/g, ' ');

export const Editor = ({ onCancel, onSave, value }: Readonly<Props>) => {
  const [text, setText] = useState(value);
  const modules = {
    history: {
      delay: 200,
      maxStack: 50,
    },
  };

  return (
    <Box
      padding={2}
      background="neutral0"
      style={{ borderRadius: 4, border: '1px solid var(--strapi-color-neutral200)' }}
      className="rich-text-editor"
    >
      <ReactQuill
        theme="snow"
        defaultValue={text}
        onChange={setText}
        modules={modules}
        placeholder="Текст"
      />
      <Flex gap={1} style={{ marginTop: 8 }}>
        <Button size="S" onClick={() => onSave(normalizeSpaces(text))}>
          Сохранить
        </Button>
        <Button size="S" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
      </Flex>
    </Box>
  );
};
