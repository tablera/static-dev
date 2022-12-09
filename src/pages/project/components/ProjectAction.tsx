import { Button, Dropdown, MenuProps, message } from 'antd';

import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { AyDialogForm, FormValues } from 'amiya';
import { apiCreateAssetsFile } from '@/api/assets-file';
import {
  V1ProjectAssetFile,
  V1ProjectAssetFileTypeEnum,
} from '@/swagger/dev/data-contracts';

interface Props {
  file: V1ProjectAssetFile;
  projectId: string;
  refresh: (file: V1ProjectAssetFile) => void;
  onUpload: (file: File) => void;
}

const fields = [
  {
    key: 'name',
    placeholder: '请输入文件名称',
    span: 24,
  },
];

function ProjectAction(props: Props) {
  const { refresh, onUpload, projectId, file } = props;
  // 新增目录是否可见
  const [addVisible, setAddVisible] = useState(false);
  const [mode, setMode] = useState('DIRECTORY');
  const addItems: MenuProps['items'] = [
    {
      label: '新建文件夹',
      key: 'addMenu',
      onClick: () => {
        setMode('DIRECTORY');
        setAddVisible(true);
      },
    },
    {
      label: '新建文件',
      key: 'addFile',
      onClick: () => {
        setMode('FILE');
        setAddVisible(true);
      },
    },
    {
      label: '上传文件',
      key: 'uploadFile',
      onClick: () => {
        // inputRef.current?.click();
      },
    },
  ];

  const apiCreateNewFile = async (values: FormValues): Promise<any> => {
    let newFile = new Blob([values.name], { type: 'text/json' }) as File;
    newFile.name = values.name;
    const { name, object_key } = await onUpload(newFile);
    let parent_id =
      (file.type === V1ProjectAssetFileTypeEnum.DIRECTORY
        ? file.id
        : file.parent_id) || '0';
    await apiCreateAssetsFile({
      ...values,
      type: 'FILE',
      object_key,
      name,
      projectId: file.project_id || projectId,
      parent_id,
    });
  };

  const addMenuBeforeSubmit = (values: FormValues, mode: string) => {
    if (mode === 'update') {
      return values;
    }
    return {
      ...values,
      type: 'DIRECTORY',
      projectId: file.project_id || projectId,
      parent_id: file.parent_id || '0',
    };
  };

  return (
    <div>
      <div className="project-heade-action">
        <Dropdown menu={{ items: addItems }}>
          <Button type="primary" shape="circle" icon={<PlusOutlined />} />
        </Dropdown>
      </div>

      <AyDialogForm
        title="新建文件"
        visible={addVisible}
        fields={fields}
        mode={mode === 'DIRECTORY' ? 'add' : 'update'}
        addApi={apiCreateAssetsFile}
        updateApi={apiCreateNewFile}
        beforeSubmit={addMenuBeforeSubmit}
        onSuccess={() => {
          refresh({
            key:
              (file.type === V1ProjectAssetFileTypeEnum.DIRECTORY
                ? file.id
                : file.parent_id) || '0',
          });
        }}
        onClose={() => setAddVisible(false)}
      />
    </div>
  );
}

export default ProjectAction;
