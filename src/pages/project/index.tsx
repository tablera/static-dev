import { apiGetProjectById } from '@/api/project';
import { V1Project, V1ProjectAssetFile } from '@/swagger/dev/data-contracts';
import { useMount } from 'ahooks';
import { Breadcrumb, Button, Popover, Space, Upload } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IRouteComponentProps } from 'umi';
import {
  InboxOutlined,
  FolderAddOutlined,
  EditOutlined,
} from '@ant-design/icons';
import './index.less';
import { AnyKeyProps, AyDialogForm, FormValues } from 'amiya';
import {
  apiCreateAssetsFile,
  apiQueryAssetsFile,
  apiUpdateMenuName,
} from '@/api/assets-file';
import { apiUploadImg } from '@/api';
import Compressor from 'compressorjs';
import DirectoryTree from 'antd/lib/tree/DirectoryTree';
import FileItem from './components/FileItem';
import { history } from 'umi';

interface TreeItem extends V1ProjectAssetFile {
  title?: string;
  key?: string | number;
  fileChildren?: TreeItem[];
  children?: TreeItem[];
}

const fields = [
  {
    key: 'name',
    placeholder: '请输入目录名称',
    span: 24,
  },
];

function CompressorFile(file: File) {
  return new Promise((resolve) => {
    let name = file.name;
    const extension = name.split('.').slice(-1)[0];
    if (['png, jpg, gif'].includes(extension)) {
      new Compressor(file, {
        quality: 0.9,
        success: (result) => {
          resolve(result);
        },
      });
    } else {
      resolve(file);
    }
  });
}

function Project(props: IRouteComponentProps) {
  const { match } = props;
  // @ts-ignore
  const [id, setId] = useState(match.params.id || '');
  const [fileId, setFileId] = useState(match.params.fileId || '');
  const [project, setProject] = useState<V1Project>({});
  const [files, setFiles] = useState<V1ProjectAssetFile[]>([]);
  const [pathFile, setPathFile] = useState<V1ProjectAssetFile[]>([]);
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [activeNode, setActiveNode] = useState<V1ProjectAssetFile>({});

  /** 加载数据 */
  const loadData = async () => {
    const { item: project } = await apiGetProjectById(id);
    setProject(project || {});
  };

  const loadFileData = async (fileId: string) => {
    if (fileId) {
      let newPathFile: V1ProjectAssetFile[] = [];
      // 找到自己
      const { list = [] } = await apiQueryAssetsFile(id, { id_in: [fileId] });
      let self = list[0];
      if (self && self.parent_id_list?.length) {
        // 找自己的父亲
        const { list: pathFile = [] } = await apiQueryAssetsFile(id, {
          id_in: self.parent_id_list || [],
        });
        newPathFile = pathFile;
      }
      setPathFile([...newPathFile, self]);
    }
  };

  /** 加载静态数据 */
  const loadAssetsData = async ({ parent_id }: TreeItem) => {
    const { list = [] } = await apiQueryAssetsFile(id, { parent_id });
    setFiles(list || []);
  };

  const onSelect = (file: V1ProjectAssetFile) => {
    if (file.type === 'DIRECTORY') {
      history.push(`/project/${file.project_id}/file/${file.id}`);
      setFileId(file.id);
      loadFileData(file.id || '');
      loadAssetsData({ parent_id: file.id || '0' });
    }
  };

  const onUpdateName = (file: V1ProjectAssetFile) => {
    setActiveNode(file);
    setEditNameVisible(true);
  };

  const updateNameBeforeSubmit = (values: FormValues) => {
    return {
      ...values,
      fileId: activeNode.id,
      projectId: id,
    };
  };

  useMount(() => {
    loadData();
    loadFileData(fileId);
    loadAssetsData({ parent_id: fileId || '0' });
  });

  return (
    <div>
      <h2 className="project-title">
        <Breadcrumb className="project-bread">
          <Breadcrumb.Item>
            <a
              onClick={() => {
                history.push(`/project/${id}`);
                loadFileData(fileId);
                loadAssetsData({ parent_id: '0' });
              }}
            >
              【{project.slug}】{project.name}
            </a>
          </Breadcrumb.Item>
          {pathFile.map((file) => (
            <Breadcrumb.Item key={file.id}>
              <a onClick={() => onSelect(file)}>{file.name}</a>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </h2>
      <Space size={24} wrap>
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onSelect={onSelect}
            onUpdateName={onUpdateName}
          />
        ))}
      </Space>

      <AyDialogForm
        title="修改名称"
        visible={editNameVisible}
        fields={fields}
        addApi={apiUpdateMenuName}
        beforeSubmit={updateNameBeforeSubmit}
        initialValues={{
          name: activeNode?.name,
        }}
        onSuccess={() => {
          loadAssetsData({ parent_id: fileId || '0' });
        }}
        onClose={() => setEditNameVisible(false)}
      />
    </div>
  );
}

export default Project;
