import {
  V1ProjectAssetFile,
  V1ProjectAssetFileTypeEnum,
  V1ProjectAssetFileVersion,
} from '@/swagger/dev/data-contracts';
import { Button, message, Modal, Select, Space } from 'antd';
import {
  ExclamationCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  apiDeleteAssetsFile,
  apiGetAssetsFileVersion,
  apiReplaceAssetsFile,
  apiUpdateMenuName,
} from '@/api/assets-file';
import { AyDialog, AyDialogForm, FormValues } from 'amiya';
import { useEffect, useMemo, useState } from 'react';
import copy from 'copy-to-clipboard';
import { diff as DiffEditor } from 'react-ace';
import ReactDiffViewer from 'react-diff-viewer';
import moment from 'moment';
import { replace } from 'lodash';

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
  // 历史版本号
  const [version, setVersion] = useState(0);
  // 版本文件
  const [versionDataMap, setVersionDataMap] = useState<Record<number, string>>(
    {},
  );
  const dataList = useMemo(() => {
    if (versionList.length <= 1) {
      return [];
    }

    return [
      versionDataMap[Number(versionList[0].version)],
      versionDataMap[version],
    ].filter((v) => v !== undefined);
  }, [version, versionDataMap, versionList]);
  // 版本回滚
  const [rollbackLoading, setRollbackLoading] = useState(false);
  const versionFile = useMemo(() => {
    return versionList.find((v) => v.version === `${version}`);
  }, [version]);

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
    let { list = [] } = await apiGetAssetsFileVersion({
      projectId: file.project_id,
      fileId: file.id,
    });
    if (list.length <= 1) {
      message.info('当前是最新的版本了');
      return;
    }
    list = list.sort((a, b) => Number(b.version) - Number(a.version));

    setVersionList(list);
    setVersion(+(list[1].version || '0'));
    setVersionVisible(true);

    await Promise.all([loadVersionData(list[0]), loadVersionData(list[1])]);
  };

  /**
   * 复制链接
   */
  const handleCopy = () => {
    copy(file.public_url || '');
    message.success('复制成功');
  };

  const loadVersionData = async (fv: V1ProjectAssetFileVersion) => {
    const version = Number(fv.version);
    if (versionDataMap[Number(version)]) {
      return;
    }

    const res = await fetch(fv.public_url!, {
      mode: 'cors',
      method: 'GET',
    });
    const text = await res.text();

    setVersionDataMap((v) => ({ ...v, [version]: text }));
  };

  useEffect(() => {
    if (versionVisible && versionFile) {
      loadVersionData(versionFile);
    }
  }, [versionVisible, version, versionFile]);

  const handleRollback = async () => {
    if (!versionFile) {
      return;
    }
    setRollbackLoading(true);
    try {
      await apiReplaceAssetsFile({
        projectId: versionFile.project_id,
        fileId: versionFile.file_id,
        object_key: versionFile.object_key,
      });
      setVersionVisible(false);
      message.success('回滚成功');
      refresh();
    } catch (e) {}

    setRollbackLoading(false);
  };

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
        onClose={() => setVersionVisible(false)}
        confirmText="回滚"
        onConfirm={handleRollback}
        confirmVisible={dataList[0] !== dataList[1]}
        loading={rollbackLoading}
      >
        <header style={{ marginBottom: 12 }}>
          <Select
            style={{ width: '300px' }}
            value={version}
            onChange={(version) => {
              setVersion(version);
            }}
            options={[...versionList]
              .slice(1)
              .filter((v) => Boolean(v))
              .map((v) => {
                return {
                  label: `${v.version} - ${moment(v.create_time).format(
                    'YYYY-MM-DD HH:mm:ss',
                  )}`,
                  value: Number(v.version),
                };
              })}
          ></Select>
        </header>
        {dataList.length == 2 &&
          (dataList[0] === dataList[1] ? (
            <div>文件内容一致</div>
          ) : (
            <ReactDiffViewer
              leftTitle={`当前版本`}
              oldValue={dataList[0]}
              rightTitle={`历史版本 - ${version} - ${moment(
                versionFile?.create_time,
              ).format('YYYY-MM-DD HH:mm:ss')}`}
              newValue={dataList[1]}
            />
          ))}
      </AyDialog>
    </div>
  );
}

export default FileAction;
