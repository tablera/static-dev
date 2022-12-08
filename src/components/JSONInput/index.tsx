import { useMount } from 'ahooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

function JSONInput(props: Props) {
  const { value = '', onChange = () => {} } = props;

  const AceValue = useMemo(() => {
    if (value) {
      try {
        let json = JSON.parse(value);
        return { a: 1 };
      } catch {}
    }
    return {};
  }, [value]);

  const handleChange = (newValue) => {
    onChange(newValue);
  };

  return (
    <AceEditor
      mode="json"
      theme="monokai"
      value={value}
      fontSize={16}
      style={{ width: '100%' }}
      onChange={handleChange}
    />
  );
}

export default JSONInput;
