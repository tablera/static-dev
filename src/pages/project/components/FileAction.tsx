import { V1ProjectAssetFileTypeEnum } from '@/swagger/dev/data-contracts';
import { Button, Space } from 'antd';
import { TreeItem } from '../type';

interface Props {
  file: TreeItem;
  /** 保存 */
  onSave: () => void;
  /** 删除 */
  onDelete: (file: TreeItem) => void;
  /** 查看历史版本 */
  onViewVersion: (file: TreeItem) => void;
  /** 修改文件名称 */
  onUpdateName: (file: TreeItem) => void;
  /** 复制文件链接 */
  onCopyLink: (file: TreeItem) => void;
  /** 保存是否可见 */
  saveVisible: boolean;
}

function FileAction(props: Props) {
  const {
    file,
    onSave,
    onDelete,
    saveVisible,
    onViewVersion,
    onUpdateName,
    onCopyLink,
  } = props;

  return (
    <div>
      <Space>
        {file.type === V1ProjectAssetFileTypeEnum.FILE && (
          <Button onClick={() => onCopyLink(file)}>复制文件链接</Button>
        )}
        <Button onClick={() => onViewVersion(file)}>查看历史版本</Button>
        <Button onClick={() => onUpdateName(file)}>修改名称</Button>
        <Button danger onClick={() => onDelete(file)}>
          删除
        </Button>
        {saveVisible && (
          <Button type="primary" onClick={onSave}>
            保存
          </Button>
        )}
      </Space>
    </div>
  );
}

export default FileAction;
