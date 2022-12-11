import { apiUploadImg } from '@/api';
import { apiReplaceAssetsFile } from '@/api/assets-file';
import Editor from '@/components/Editor';
import { V1ProjectAssetFileTypeEnum } from '@/swagger/dev/data-contracts';
import { Button, message, Skeleton, Space } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import FileAction from './FileAction';
import mime from 'mime-types';
import FileItem from './FileItem';
import { TreeItem } from '../type';
import { LinkOutlined } from '@ant-design/icons';

interface Props {
  file: TreeItem;
  /** 选中文件 */
  onSelect: (file: TreeItem) => void;
  /** 删除文件 */
  onDeleteAssets: (file: TreeItem) => void;
  /** 查看历史版本 */
  onViewVersion: (file: TreeItem) => void;
  /** 修改文件名称 */
  onUpdateName: (file: TreeItem) => void;
  /** 复制文件链接 */
  onCopyLink: (file: TreeItem) => void;
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

/** 文件详情 */
function FileContent(props: Props) {
  const {
    file,
    onSelect,
    onDeleteAssets,
    onViewVersion,
    onUpdateName,
    onCopyLink,
  } = props;
  const url = file.public_url || '';
  const extension = url.split('.').slice(-1)[0];
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');

  const contentType = useMemo(() => {
    return mime.lookup(url) || 'text/plain';
  }, [extension]);

  const renderContent = () => {
    // 文件夹
    if (file.type === V1ProjectAssetFileTypeEnum.DIRECTORY) {
      // @ts-ignore 展示子文件
      return (
        <div>
          <div className="tree-item-file-list">
            <Space size="large" wrap>
              {file.children?.map((childFile: TreeItem) => (
                <FileItem
                  file={childFile}
                  key={childFile.key}
                  onSelect={(file) => onSelect(file)}
                />
              ))}
            </Space>
          </div>
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

  const handleSave = async (value: string) => {
    if (value === originalContent) {
      return message.warn('内容未修改');
    }

    const f = new File([value], file.name || '', { type: contentType });

    // 保存信息
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
    setOriginalContent(value);
  };

  useEffect(() => {
    if (
      !imgExtension.includes(extension) &&
      file.type !== V1ProjectAssetFileTypeEnum.DIRECTORY &&
      file.public_url
    ) {
      setLoading(true);
      fetch(file.public_url + `?t=${Date.now()}`, {
        mode: 'cors',
        method: 'GET',
      })
        .then((response) => response.text())
        .then((res) => {
          setContent(res);
          setOriginalContent(res);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [file]);

  if (!file.id) {
    return <div></div>;
  }

  if (loading) {
    return (
      <div
        style={{
          padding: '32px',
        }}
      >
        <Skeleton active />
      </div>
    );
  }

  return (
    <div className="tree-item-content">
      <header className="project-tree-content-header">
        <span>
          {file.name}
          <Button type="link">
            <LinkOutlined onClick={() => onCopyLink(file)} />
          </Button>
        </span>
        <FileAction
          file={file}
          onCopyLink={onCopyLink}
          onViewVersion={onViewVersion}
          onUpdateName={onUpdateName}
          onSave={() => handleSave(content)}
          onDelete={onDeleteAssets}
          saveVisible={
            !imgExtension.includes(extension) &&
            file.type !== V1ProjectAssetFileTypeEnum.DIRECTORY
          }
        />
      </header>

      {!imgExtension.includes(extension) &&
      file.type !== V1ProjectAssetFileTypeEnum.DIRECTORY ? (
        <div className="tree-item-file-content" key={file.id}>
          <Editor
            filename={file.name}
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
