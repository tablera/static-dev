import {
  V1ProjectAssetFile,
  V1ProjectAssetFileTypeEnum,
  V1ProjectAssetFileVersion,
} from '@/swagger/dev/data-contracts';
import { Button, message, Modal, Space } from 'antd';
import {
  ExclamationCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  apiDeleteAssetsFile,
  apiGetAssetsFileVersion,
  apiUpdateMenuName,
} from '@/api/assets-file';
import { AyDialog, AyDialogForm, FormValues } from 'amiya';
import { useEffect, useMemo, useState } from 'react';
import copy from 'copy-to-clipboard';
import { diff as DiffEditor } from 'react-ace';

import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';

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

function FileAction(props: Props) {
  const { file, refresh, onSave, saveVisible } = props;
  // 编辑文件名是否可见
  const [editNameVisible, setEditNameVisible] = useState(false);
  // 历史是否可见
  const [versionVisible, setVersionVisible] = useState(false);
  // 历史版本
  const [versionList, setVersionList] = useState<V1ProjectAssetFileVersion[]>(
    [],
  );
  // 历史版本进度
  const [versionIndex, setVersionIndex] = useState(0);
  // 历史两个文件
  const versionFile = useMemo(() => {
    return [versionList[versionIndex], versionList[versionIndex + 1]];
  }, [versionList, versionIndex]);
  // 历史两个文件内容
  const [versionData, setVersionData] = useState<[string, string]>(['', '']);

  const url = file.public_url || '';
  const extension = url.split('.').slice(-1)[0];

  const mode = useMemo(() => {
    if (extension === 'js') {
      return 'javascript';
    } else if (extension === 'md') {
      return 'markdown';
    }
    return extension || 'html';
  }, [extension]);

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

  /**
   * 查看历史版本
   */
  const handleViewHistory = async () => {
    const { list = [] } = await apiGetAssetsFileVersion({
      projectId: file.project_id,
      fileId: file.id,
    });
    if (list.length <= 1) {
      message.info('当前是最新的版本了');
      return;
    }
    setVersionList(list.reverse());
    setVersionData(['', '']);
    setVersionIndex(0);
    setVersionVisible(true);
  };

  /**
   * 复制链接
   */
  const handleCopy = () => {
    copy(file.public_url || '');
    message.success('复制成功');
  };

  const loadVerstionData = () => {
    let [file1, file2] = versionFile;
    fetch(file1.public_url + `?t=${Date.now()}`, {
      mode: 'cors',
      method: 'GET',
    })
      .then((response) => response.text())
      .then((res1) => {
        fetch(file2.public_url + `?t=${Date.now()}`, {
          mode: 'cors',
          method: 'GET',
        })
          .then((response) => response.text())
          .then((res) => {
            setVersionData([res1, res]);
          });
      });
  };

  useEffect(() => {
    if (versionVisible && versionFile.length === 2) {
      loadVerstionData();
    }
  }, [versionVisible, versionFile]);

  if (!file.id) {
    return <div></div>;
  }

  return (
    <div>
      <Space>
        {file.type === V1ProjectAssetFileTypeEnum.FILE && (
          <Button onClick={handleCopy}>复制文件链接</Button>
        )}
        <Button onClick={handleViewHistory}>查看历史版本</Button>
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
      <AyDialog
        title="查看历史版本"
        visible={versionVisible}
        width={1200}
        destroyOnClose
        confirmVisible={false}
        onClose={() => setVersionVisible(false)}
      >
        <header style={{ marginBottom: 12 }}>
          <Button
            disabled={versionIndex === 0}
            onClick={() => setVersionIndex(versionIndex - 1)}
          >
            <LeftOutlined />
          </Button>
          <Button
            disabled={versionIndex >= versionList.length - 2}
            onClick={() => setVersionIndex(versionIndex + 1)}
          >
            <RightOutlined />
          </Button>
        </header>
        {versionData[0] && (
          <DiffEditor
            value={versionData}
            theme="monokai"
            height="600px"
            width="100%"
            fontSize={16}
            mode={mode}
          />
        )}
      </AyDialog>
    </div>
  );
}

export default FileAction;
