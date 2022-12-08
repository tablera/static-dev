import { FolderOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, message } from 'antd';
import dayjs from 'dayjs';
import { EllipsisOutlined } from '@ant-design/icons';
import { V1ProjectAssetFile } from '@/swagger/dev/data-contracts';
import copy from 'copy-to-clipboard';

interface Props {
  file: V1ProjectAssetFile;
  onSelect: (file: V1ProjectAssetFile) => void;
  onUpdateName: (file: V1ProjectAssetFile) => void;
}

const imgExtension = ['png', 'webp', 'svg', 'jpg', 'jpeg', 'gif', 'bmp'];

function FileItem(props: Props) {
  const { file, onSelect, onUpdateName } = props;
  let url = file.public_url;
  const extension = url.split('.').slice(-1)[0];

  const items: MenuProps['items'] = [
    {
      label: '重命名',
      key: 'rename',
      onClick: () => {
        onUpdateName(file);
      },
    },
    {
      label: '复制文件链接',
      key: 'copy',
      onClick: () => {
        handleCopyFilePath();
      },
    },
    {
      type: 'divider',
    },
    {
      label: '删除文件',
      key: 'delete',
    },
  ];

  /** 复制文件路径 */
  const handleCopyFilePath = () => {
    copy(file.public_url || '');
    message.success('复制成功');
  };

  const handleDelete = () => {};

  const renderCover = () => {
    if (file.type === 'DIRECTORY') {
      return <FolderOutlined className="project-file-cover-icon" />;
    }
    if (imgExtension.includes(extension)) {
      return (
        <img src={file.public_url} className="project-file-cover-img" alt="" />
      );
    }
  };

  return (
    <div onClick={() => onSelect(file)}>
      <div className="project-file-item" key={file.id}>
        <div className="project-file-action">
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button shape="circle" icon={<EllipsisOutlined />} />
          </Dropdown>
        </div>
        <div className="project-file-cover">{renderCover()}</div>
        <div className="project-file-label">{file.name}</div>
        <div className="project-file-time">
          {dayjs(file.update_time).format('MM-DD HH:mm')}
        </div>
      </div>
    </div>
  );
}

export default FileItem;
