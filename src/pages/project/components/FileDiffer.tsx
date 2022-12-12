import {
  apiGetAssetsFileVersion,
  apiReplaceAssetsFile,
} from '@/api/assets-file';
import { V1ProjectAssetFileVersion } from '@/swagger/dev/data-contracts';
import { AyDialog, AySelect } from 'amiya';
import { message } from 'antd';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import { TreeItem } from '../type';
import { isImage } from '../util';

interface Props {
  file: TreeItem;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function FileDiffer(props: Props) {
  const { file, visible, onClose, onSuccess } = props;
  // 当前是否可见
  const [currVsibile, setCurrVsibile] = useState(visible);

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
  // 文件列表
  const dataList = useMemo(() => {
    if (versionList.length <= 1) {
      return [];
    }

    return [
      versionDataMap[Number(versionList[0].version)],
      versionDataMap[version],
    ].filter((v) => v !== undefined);
  }, [version, versionDataMap, versionList]);
  // 版本回滚加载中
  const [rollbackLoading, setRollbackLoading] = useState(false);
  // 版本文件
  const versionFile = useMemo(() => {
    return versionList.find((v) => v.version === `${version}`);
  }, [version]);

  const handleRollback = async () => {
    if (!versionFile) {
      return;
    }
    setRollbackLoading(true);
    try {
      await apiReplaceAssetsFile({
        projectId: versionFile.project_id,
        // @ts-ignore
        fileId: versionFile.file_id,
        object_key: versionFile.object_key,
      });
      message.success('回滚成功');
      onSuccess();
      onClose();
      setCurrVsibile(false);
    } catch (e) {}

    setRollbackLoading(false);
  };

  /**
   * 查看历史版本
   */
  const handleViewVersion = async () => {
    let { list = [] } = await apiGetAssetsFileVersion({
      projectId: file.project_id,
      fileId: file.id,
    });
    if (list.length <= 1) {
      message.info('当前是最新的版本了');
      onClose();
      return;
    }
    list = list.sort((a, b) => Number(b.version) - Number(a.version));

    setVersionList(list);
    setVersion(+(list[1].version || '0'));

    await Promise.all([loadVersionData(list[0]), loadVersionData(list[1])]);
    setCurrVsibile(true);
  };

  /**
   * 请求加载资源文件
   * @param fv 资源文件
   */
  const loadVersionData = async (fv: V1ProjectAssetFileVersion) => {
    const version = Number(fv.version);
    if (versionDataMap[Number(version)]) {
      return;
    }
    let text = '';
    if (isImage(file)) {
      text = fv.public_url || '';
    } else {
      const res = await fetch(fv.public_url!, {
        mode: 'cors',
        method: 'GET',
      });
      text = await res.text();
    }

    setVersionDataMap((v) => ({ ...v, [version]: text }));
  };

  useEffect(() => {
    if (visible) {
      handleViewVersion();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && versionFile) {
      loadVersionData(versionFile);
    }
  }, [currVsibile, version, versionFile]);

  return (
    <AyDialog
      title="查看历史版本"
      visible={currVsibile}
      width={1200}
      destroyOnClose
      onClose={() => {
        setCurrVsibile(false);
        onClose();
      }}
      confirmText="回滚"
      onConfirm={handleRollback}
      confirmVisible={dataList[0] !== dataList[1]}
      loading={rollbackLoading}
      bodyStyle={{
        overflowX: 'scroll',
      }}
    >
      <header style={{ marginBottom: 12 }}>
        <AySelect
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
        />
      </header>
      {isImage(file) ? (
        <div className="image-change-body">
          <div className="image-change-left">
            <div className="image-change-header">现在当前版本的图片</div>
            <div className="image-change-body">
              <img src={dataList[0]} alt="" />
            </div>
          </div>
          <div className="image-change-right">
            <div className="image-change-header">{`历史版本 - ${version} - ${moment(
              versionFile?.create_time,
            ).format('YYYY-MM-DD HH:mm:ss')}`}</div>
            <div className="image-change-body">
              <img src={dataList[1]} alt="" />
            </div>
          </div>
        </div>
      ) : (
        <ReactDiffViewer
          leftTitle={`当前版本`}
          oldValue={dataList[0]}
          rightTitle={`历史版本 - ${version} - ${moment(
            versionFile?.create_time,
          ).format('YYYY-MM-DD HH:mm:ss')}`}
          newValue={dataList[1]}
        />
      )}
    </AyDialog>
  );
}

export default FileDiffer;
