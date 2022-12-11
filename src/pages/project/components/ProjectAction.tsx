import { Button, Dropdown, MenuProps, message } from 'antd';

import { PlusOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { AyDialogForm, FormValues } from 'amiya';
import { apiCreateAssetsFile } from '@/api/assets-file';
import {
  V1ProjectAssetFile,
  V1ProjectAssetFileTypeEnum,
} from '@/swagger/dev/data-contracts';
import mime from 'mime-types';

interface Props {
  file: V1ProjectAssetFile;
  projectId: string;
  refresh: (file: V1ProjectAssetFile & { key: string }) => void;
  onUpload: (file: File) => void;
  // 打开上传弹窗
  openUpload: () => void;

  onNewFile?: (id: string) => void;
}

const fields = [
  {
    key: 'name',
    placeholder: '请输入文件名称',
    span: 24,
  },
];

function ProjectAction(props: Props) {
  const { refresh, onUpload, projectId, file, openUpload } = props;
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
        openUpload();
        // inputRef.current?.click();
      },
    },
  ];

  const parentId = useMemo(() => {
    return (
      (file.type === V1ProjectAssetFileTypeEnum.DIRECTORY
        ? file.id
        : file.parent_id) || '0'
    );
  }, [file]);

  const apiCreateNewFile = async (values: FormValues): Promise<any> => {
    const newFile = new File([], values.name, {
      type: mime.lookup(values.name) || 'text/plain',
    });

    const { name, object_key } = await onUpload(newFile);
    let parent_id =
      (file.type === V1ProjectAssetFileTypeEnum.DIRECTORY
        ? file.id
        : file.parent_id) || '0';
    const { id } = await apiCreateAssetsFile({
      ...values,
      type: 'FILE',
      object_key,
      name,
      projectId: file.project_id || projectId,
      parent_id,
    });

    if (id) {
      props.onNewFile?.(id);
    }
  };

  const addMenuBeforeSubmit = (values: FormValues, mode: string) => {
    if (mode === 'update') {
      return values;
    }
    return {
      ...values,
      type: 'DIRECTORY',
      projectId: file.project_id || projectId,
      parent_id: parentId,
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
        title={mode === 'DIRECTORY' ? '新建文件夹' : '新建文件'}
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
