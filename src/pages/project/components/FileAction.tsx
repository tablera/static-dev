import { V1ProjectAssetFileTypeEnum } from '@/swagger/dev/data-contracts';
import { Button, Radio, Space } from 'antd';
import { TreeItem } from '../type';

interface Props {
  file: TreeItem;
  /** 列表展示类型 */
  listType: string;
  /** 列表展示类型切换 */
  onListTypeChange: (type: string) => void;
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

const options = [
  { label: '为列表', value: 'list' },
  { label: '为图标', value: 'icon' },
];

function FileAction(props: Props) {
  const {
    file,
    listType,
    onListTypeChange,
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
        {file.type === V1ProjectAssetFileTypeEnum.DIRECTORY && (
          <Radio.Group
            options={options}
            optionType="button"
            value={listType}
            onChange={(e) => onListTypeChange(e.target.value)}
          />
        )}
        {file.type === V1ProjectAssetFileTypeEnum.FILE && (
          <Button onClick={() => onCopyLink(file)}>复制文件链接</Button>
        )}
        {file.type === V1ProjectAssetFileTypeEnum.FILE && (
          <Button onClick={() => onViewVersion(file)}>查看历史版本</Button>
        )}

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
