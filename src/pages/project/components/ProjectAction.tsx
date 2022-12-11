import { Button, Dropdown, MenuProps, message } from 'antd';

import { PlusOutlined } from '@ant-design/icons';

interface Props {
  // 打开上传弹窗
  openUpload: () => void;
  /** 新增文件夹 */
  onAddMenu: () => void;
  /** 新增文件 */
  onAddFile: () => void;
}

function ProjectAction(props: Props) {
  const { onAddMenu, openUpload, onAddFile } = props;
  const addItems: MenuProps['items'] = [
    {
      label: '新建文件夹',
      key: 'addMenu',
      onClick: () => onAddMenu(),
    },
    {
      label: '新建文件',
      key: 'addFile',
      onClick: () => onAddFile(),
    },
    {
      label: '上传文件',
      key: 'uploadFile',
      onClick: () => openUpload(),
    },
  ];

  return (
    <div>
      <div className="project-heade-action">
        <Dropdown menu={{ items: addItems }}>
          <Button type="primary" shape="circle" icon={<PlusOutlined />} />
        </Dropdown>
      </div>
    </div>
  );
}

export default ProjectAction;
