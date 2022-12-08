import { useMount } from 'ahooks';
import Editor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import { useEffect, useRef, useState } from 'react';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

function JSONInput(props: Props) {
  const { value = '', onChange = () => {} } = props;
  const [currValue, setCurrValue] = useState(value || '');
  const inputRef = useRef<HTMLDivElement>();
  const editRef = useRef<any>();

  const init = () => {
    if (editRef.current) {
      return;
    }
    const options = {};
    const editor = new Editor(inputRef.current, options);
    editRef.current = editor;
    if (currValue) {
      editor.set(JSON.parse(currValue));
    }
  };

  const handleChangeValue = () => {
    let currValue = JSON.stringify(editRef.current?.get());
    setCurrValue(currValue);
    onChange(currValue);
  };

  useEffect(() => {
    if (value !== currValue) {
      requestAnimationFrame(() => {
        try {
          setCurrValue(value);
          editRef.current?.set(JSON.parse(value));
        } catch {}
      });
    }
  }, [value]);

  useMount(() => {
    init();
  });

  return <div ref={inputRef} onInput={() => handleChangeValue()}></div>;
}

export default JSONInput;
