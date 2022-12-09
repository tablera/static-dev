import { useMemo } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  mode: string;
}

function AceInput(props: Props) {
  const { value = '', onChange = () => {}, mode } = props;

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
      mode={mode}
      theme="monokai"
      value={value}
      fontSize={16}
      style={{ width: '100%' }}
      onChange={handleChange}
    />
  );
}

export default AceInput;
