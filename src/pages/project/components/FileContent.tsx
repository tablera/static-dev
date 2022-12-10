import { apiUploadImg } from '@/api';
import { apiReplaceAssetsFile } from '@/api/assets-file';
import AceInput from '@/components/AceInput';
import {
  V1ProjectAssetFile,
  V1ProjectAssetFileTypeEnum,
} from '@/swagger/dev/data-contracts';
import { AyDialogForm } from 'amiya';
import { message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import FileAction from './FileAction';
import mime from 'mime-types';

interface Props {
  file: V1ProjectAssetFile;
  refresh: () => void;
}

const imgExtension = ['png', 'webp', 'svg', 'jpg', 'jpeg', 'gif', 'bmp'];
const editableExtension = [
  'json',
  'html',
  'javascript',
  'js',
  'css',
  'markdown',
  'md',
  'xml',
];

function FileContent(props: Props) {
  const { file, refresh } = props;
  const url = file.public_url || '';
  const extension = url.split('.').slice(-1)[0];
  const [content, setContent] = useState('');

  const mode = useMemo(() => {
    return (
      {
        js: 'javascript',
        md: 'markdown',
        sql: 'mysql',
        go: 'golang',
      }[extension] || extension
    );
  }, [extension]);

  const contentType = useMemo(() => {
    return mime.lookup(extension || '.txt') || 'text/plain';
  }, [extension]);

  const renderContent = () => {
    if (file.type === V1ProjectAssetFileTypeEnum.DIRECTORY) {
      return (
        <div className="tree-item-file-content">
          <img
            src="https://cdn.dev.tablera.cn/project/icons/asset/file-folder.svg"
            alt=""
          />
          <p className="tree-item-file-content-text">{file.name}</p>
          <p>{file.id}</p>
        </div>
      );
    } else if (imgExtension.includes(extension)) {
      return (
        <div className="tree-item-file-content">
          <img src={url} alt="" />
        </div>
      );
    } else if (editableExtension.includes(extension)) {
      return '';
    }
    return url;
  };

  const handleSave = async (content: string) => {
    const f = new File([content], file.name || '', { type: contentType });

    // 图片保存信息
    let remarkJson = {
      tag: 'DEV',
      path: location.pathname,
      only_allow_image: false,
      remark: {
        projectId: file.project_id,
        projectName: file.name,
        name: file.name,
      },
    };
    const res = await apiUploadImg({
      file: f,
      only_allow_image: false,
      remark: JSON.stringify(remarkJson),
    });
    const object_key = res.object_key;

    await apiReplaceAssetsFile({
      projectId: file.project_id,
      fileId: file.id,
      projectName: file.name,
      object_key,
    });
    message.success('保存成功');
  };

  useEffect(() => {
    if (
      !imgExtension.includes(extension) &&
      file.type !== V1ProjectAssetFileTypeEnum.DIRECTORY &&
      file.public_url
    ) {
      fetch(file.public_url + `?t=${Date.now()}`, {
        mode: 'cors',
        method: 'GET',
      })
        .then((response) => response.text())
        .then((res) => {
          setContent(res);
        });
    }
  }, [file]);

  if (!file.id) {
    return <div></div>;
  }
  return (
    <div className="tree-item-content">
      <header className="project-tree-contnet-header">
        <span></span>
        <FileAction
          file={file}
          refresh={refresh}
          onSave={handleSave}
          saveVisible={
            !imgExtension.includes(extension) &&
            file.type !== V1ProjectAssetFileTypeEnum.DIRECTORY
          }
        />
      </header>
      {!imgExtension.includes(extension) &&
      file.type !== V1ProjectAssetFileTypeEnum.DIRECTORY ? (
        <div className="tree-item-file-content" key={file.id}>
          <AceInput
            mode={mode}
            value={content}
            onChange={setContent}
            onSave={handleSave}
          />
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
}

export default FileContent;
