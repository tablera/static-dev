import { V1ProjectAssetFile } from '@/swagger/dev/data-contracts';
import { Button, message, Modal, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  apiDeleteAssetsFile,
  apiReplaceAssetsFile,
  apiUpdateMenuName,
} from '@/api/assets-file';
import { AyDialogForm, FormValues } from 'amiya';
import { useState } from 'react';
import { apiUploadImg } from '@/api';

interface Props {
  file: V1ProjectAssetFile;
  refresh: () => void;
  onSave: () => void;
  saveVisible: boolean;
}

const fields = [
  {
    key: 'name',
    placeholder: '请输入资源名称',
    span: 24,
  },
];

function FileAction(props: Props) {
  const { file, refresh, onSave, saveVisible } = props;
  // 编辑文件名是否可见
  const [editNameVisible, setEditNameVisible] = useState(false);

  /**
   * 删除资源
   */
  const onDeleteAssets = () => {
    Modal.confirm({
      title: '删除提示',
      content: '确定要删除这个文件吗？',
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        await apiDeleteAssetsFile({
          fileId: file.id,
          projectId: file.project_id,
        });
        refresh();
        message.success('删除成功');
      },
    });
  };

  /**
   * 修改资源名称
   */
  const updateNameBeforeSubmit = (values: FormValues) => {
    return {
      ...values,
      fileId: file.id,
      projectId: file.project_id,
    };
  };

  if (!file.id) {
    return <div></div>;
  }

  return (
    <div>
      <Space>
        <Button onClick={() => setEditNameVisible(true)}>修改名称</Button>
        <Button danger onClick={onDeleteAssets}>
          删除
        </Button>
        {saveVisible && (
          <Button type="primary" onClick={onSave}>
            保存
          </Button>
        )}
      </Space>
      <AyDialogForm
        title="修改名称"
        visible={editNameVisible}
        fields={fields}
        addApi={apiUpdateMenuName}
        beforeSubmit={updateNameBeforeSubmit}
        initialValues={{
          name: file?.name,
        }}
        onSuccess={() => {
          refresh();
        }}
        onClose={() => setEditNameVisible(false)}
      />
    </div>
  );
}

export default FileAction;
