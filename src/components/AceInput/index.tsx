import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  mode: string;

  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
}

function AceInput(props: Props) {
  const [value, setValue] = useState(props.value || '');
  const editor = useRef();

  useEffect(() => {
    setValue(props.value || '');
  }, [props.value]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    props.onChange?.(newValue);
  };

  return (
    <>
      <AceEditor
        mode={props.mode}
        theme="monokai"
        value={value}
        fontSize={16}
        width="100%"
        height="100%"
        onChange={handleChange}
        enableBasicAutocompletion
        enableLiveAutocompletion
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          tabSize: 2,
          useSoftTabs: true,
        }}
        commands={[
          {
            name: 'save',
            bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
            exec: (editor) => {
              props.onSave?.(editor.getValue());
            },
          },
        ]}
      />
    </>
  );
}

export default AceInput;
