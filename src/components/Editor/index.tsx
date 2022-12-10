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
import 'ace-builds/src-noconflict/ext-searchbox';

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

function Editor(props: Props) {
  const [value, setValue] = useState(props.value || '');

  useEffect(() => {
    setValue(props.value || '');
  }, [props.value]);

  const editor = useRef(null);

  const mode = useMemo(() => {
    const contentType = mime.lookup(props.filename || '') || 'text/plain';
    return mime.extension(contentType) || 'text';
  }, [props.filename]);

  // 这里是为了解决 exec 不会随 props 更新的问题
  const et = useRef(new EventTarget());
  et.current = new EventTarget();
  et.current.addEventListener('command-save', () => {
    props.onSave?.(value);
  });

  const handleChange = (newValue: string) => {
    setValue(newValue);
    props.onChange?.(newValue);
  };

  return (
    <div className="editor">
      <div className="editor-header">{props.filename}</div>
      <AceEditor
        ref={editor}
        mode={mode}
        theme="tomorrow"
        value={props.value}
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
            exec: () => et.current.dispatchEvent(new Event('command-save')),
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

export default Editor;
