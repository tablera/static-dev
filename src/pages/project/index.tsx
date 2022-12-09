import { apiGetProjectById } from '@/api/project';
import { V1Project, V1ProjectAssetFile } from '@/swagger/dev/data-contracts';
import { useMount } from 'ahooks';
import {
  Breadcrumb,
  Button,
  Dropdown,
  MenuProps,
  message,
  Modal,
  Space,
} from 'antd';
import { useRef, useState } from 'react';
import { IRouteComponentProps } from 'umi';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import './index.less';
import { AnyKeyProps, AyDialog, AyDialogForm, FormValues } from 'amiya';
import {
  apiCreateAssetsFile,
  apiDeleteAssetsFile,
  apiQueryAssetsFile,
  apiReplaceAssetsFile,
  apiUpdateMenuName,
} from '@/api/assets-file';
import Compressor from 'compressorjs';
import FileItem from './components/FileItem';
import { history } from 'umi';
import { apiUploadImg } from '@/api';
import { get } from '@/utils/ajax';
import JSONInput from '@/components/JSONInput';
import ProjectAction from './components/ProjectAction';

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

const editFileFields = [
  {
    key: 'content',
    placeholder: '请输入文件内容',
    type: 'custom',
    renderContent: () => {
      return <JSONInput />;
    },
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
  // 项目ID
  const [id, setId] = useState(match.params.id || '');
  // 当前目录 Id
  const [fileId, setFileId] = useState(match.params.fileId || '');
  // 当前项目
  const [project, setProject] = useState<V1Project>({});
  // 当前项目下的文件列表
  const [files, setFiles] = useState<V1ProjectAssetFile[]>([]);
  // 面包屑文件路径
  const [pathFile, setPathFile] = useState<V1ProjectAssetFile[]>([]);
  // 编辑文件名是否可见
  const [editNameVisible, setEditNameVisible] = useState(false);
  // 选择的文件，接口处理用
  const [activeNode, setActiveNode] = useState<V1ProjectAssetFile>({});
  // 新增目录是否可见
  const [addMenuVisible, setAddMenuVisible] = useState(false);
  // 选择文件是否可见
  const [uploadVisible, setUploadVisible] = useState(false);
  // 上传中
  const [uploading, setUploading] = useState(false);
  // 文件上传元素
  const inputRef = useRef<HTMLInputElement>();
  // 文件编辑弹窗
  const [editFileVisible, setEditFileVisible] = useState(false);
  const [editFileDefaultValue, setEditFileDefaultValue] = useState<AnyKeyProps>(
    {},
  );

  /** 加载数据 */
  const loadData = async () => {
    const { item: project } = await apiGetProjectById(id);
    setProject(project || {});
  };

  /** 加载当前文件夹数据 */
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

  /** 选择文件 */
  const onSelect = (file: V1ProjectAssetFile) => {
    // 选择文件进入
    if (file.type === 'DIRECTORY') {
      history.push(`/project/${file.project_id}/file/${file.id}`);
      setFileId(file.id);
      loadFileData(file.id || '');
      loadAssetsData({ parent_id: file.id || '0' });
    }
  };

  /**
   * 更改文件名称
   */
  const onUpdateName = (file: V1ProjectAssetFile) => {
    setActiveNode(file);
    setEditNameVisible(true);
  };

  /**
   * 删除文件
   */
  const onDeleteFile = (file: V1ProjectAssetFile) => {
    if (file.type === 'DIRECTORY') {
    } else {
      Modal.confirm({
        title: '删除提示',
        content: '确定要删除这个文件吗？',
        icon: <ExclamationCircleOutlined />,
        onOk: async () => {
          await apiDeleteAssetsFile({
            fileId: file.id,
            projectId: id,
          });
          loadFileData(fileId);
          loadAssetsData({ parent_id: fileId || '0' });
          message.success('删除成功');
        },
      });
    }
  };

  /** 编辑文件 */
  const onEditFile = (file: V1ProjectAssetFile) => {
    fetch(file.public_url || '', {
      mode: 'cors',
      method: 'GET',
    })
      .then((response) => response.text())
      .then((res) => {
        setEditFileDefaultValue(res);
        setEditFileVisible(true);
        setActiveNode(file);
      });
  };

  /** 编辑文件 */
  const apiEditFile = async (values: FormValues) => {
    let content = values.content;
    let file = new Blob([content], { type: 'text/json' });
    file.name = activeNode.name;

    // 图片保存信息
    let remarkJson = {
      tag: 'DEV',
      path: location.pathname,
      only_allow_image: false,
      remark: {
        projectId: id,
        projectName: project.name,
        name: file.name,
      },
    };
    const res = await apiUploadImg({
      file,
      only_allow_image: false,
      remark: JSON.stringify(remarkJson),
    });
    const object_key = res.object_key;

    await apiReplaceAssetsFile({
      projectId: id,
      fileId: activeNode.id,
      object_key,
    });
  };

  const handleSaveFile = async (file: File) => {
    // 图片保存信息
    let remarkJson = {
      tag: 'DEV',
      path: location.pathname,
      only_allow_image: false,
      remark: {
        projectId: id,
        projectName: project.name,
        name: file.name,
      },
    };
    const newFile = await CompressorFile(file);
    const res = await apiUploadImg({
      file: newFile,
      only_allow_image: false,
      remark: JSON.stringify(remarkJson),
    });
    const name = file.name;
    const object_key = res.object_key;
    return {
      name,
      object_key,
    };
  };

  /** 上传文件 */
  const handleUpload = async (list: Array<File>) => {
    setUploadVisible(false);
    setUploading(true);
    for (let i = 0; i < list.length; i++) {
      let file = list[i];
      const { object_key } = await handleSaveFile(file);

      await apiCreateAssetsFile({
        type: 'FILE',
        projectId: id,
        parent_id: fileId || '0',
        object_key,
        name: name,
      });
    }
    setUploading(false);
    loadFileData(fileId);
    loadAssetsData({ parent_id: fileId || '0' });
    return false;
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
    <div className="project" onDragEnter={(e) => setUploadVisible(true)}>
      <input
        type="file"
        onInput={(e) => handleUpload(e.target?.files)}
        value=""
        ref={inputRef}
        multiple
        className="project-opacity-input"
      />
      {uploadVisible && (
        <div
          className="project-upload-layer"
          onDragLeave={(e) => {
            setUploadVisible(false);
          }}
        >
          <input
            type="file"
            onInput={(e) => handleUpload(e.target?.files)}
            value=""
            ref={inputRef}
            multiple
          />
          <div className="project-upload-text">
            <p>放开上传到此处</p>
            <div style={{ color: 'rgb(99, 125, 255)' }}>
              【{project.slug}】{project.name}
            </div>
          </div>
        </div>
      )}
      <header className="project-header">
        <Breadcrumb className="project-bread">
          <Breadcrumb.Item>
            <a
              onClick={() => {
                history.push(`/project/${id}`);
                setPathFile([]);
                setFileId('');
                loadFileData('');
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
        <div className="project-heade-action">
          <ProjectAction
            file={activeNode}
            projectId={id}
            refresh={(file) => {
              loadAssetsData({ parent_id: fileId || '0' });
            }}
            onUpload={handleSaveFile}
          />
        </div>
      </header>
      <Space size={24} wrap>
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onSelect={onSelect}
            onUpdateName={onUpdateName}
            onDeleteFile={onDeleteFile}
            onEditFile={onEditFile}
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
      <AyDialogForm
        title="文件编辑"
        fields={editFileFields}
        visible={editFileVisible}
        width={600}
        addApi={apiEditFile}
        initialValues={{
          content: editFileDefaultValue,
        }}
        onSuccess={() => {
          loadAssetsData({ parent_id: fileId || '0' });
          message.success('编辑成功');
        }}
        onClose={() => setEditFileVisible(false)}
      />
    </div>
  );
}

export default Project;
