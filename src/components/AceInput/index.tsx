import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import mime from 'mime-types';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/mode-xml';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/ext-language_tools';

import * as prettier from 'prettier/standalone';

import parserBabel from 'prettier/parser-babel';
import parserHTML from 'prettier/parser-html';
import parserPostcss from 'prettier/parser-postcss';
import parserYAML from 'prettier/parser-yaml';
import parserMarkdown from 'prettier/parser-markdown';

import './index.less';

interface Props {
  filename?: string;
  value?: string;

  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
}

function AceInput(props: Props) {
  const [value, setValue] = useState(props.value || '');
  const editor = useRef();

  const contentTpe = useMemo(() => {
    if (!props.filename) {
      return 'text/plain';
    }

    return mime.lookup(props.filename) || 'text/plain';
  }, [props.filename]);

  const mode = useMemo(() => {
    return mime.extension(contentTpe) || 'text';
  }, [contentTpe]);

  useEffect(() => {
    setValue(props.value || '');
  }, [props.value]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    props.onChange?.(newValue);
  };

  return (
    <div className="editor">
      <div className="editor-header">{props.filename}</div>
      <AceEditor
        mode={mode}
        theme="tomorrow"
        value={value}
        fontSize={16}
        width="100%"
        height="100%"
        onChange={handleChange}
        enableBasicAutocompletion
        enableLiveAutocompletion
        debounceChangePeriod={200}
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
          {
            name: 'format',
            bindKey: { win: 'Alt-Shift-F', mac: 'Option-Shift-F' },
            exec: (editor) => {
              const value = editor.getValue();
              try {
                handleChange(
                  prettier.format(value, {
                    parser: mode,
                    plugins: [
                      parserBabel,
                      parserHTML,
                      parserPostcss,
                      parserYAML,
                      parserMarkdown,
                    ],
                  }),
                );
              } catch (e) {
                console.error(e);
              }
            },
          },
        ]}
      />
    </div>
  );
}

export default AceInput;
