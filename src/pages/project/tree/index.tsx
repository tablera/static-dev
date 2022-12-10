import { apiGetProjectById } from '@/api/project';
import {
  V1Project,
  V1ProjectAssetFile,
  V1ProjectAssetFileTypeEnum,
} from '@/swagger/dev/data-contracts';
import { useMount } from 'ahooks';
import { Button, Space, Upload } from 'antd';
import { useMemo, useRef, useState } from 'react';
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
import FileContent from '../components/FileContent';
import ProjectAction from '../components/ProjectAction';
import FileAction from '../components/FileAction';
import SplitPane from 'react-split-pane';

interface TreeItem extends V1ProjectAssetFile {
  title?: string;
  key?: string | number;
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

const updateTreeData = (
  list: TreeItem[],
  key: React.Key,
  children: TreeItem[],
): TreeItem[] =>
  list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children: children,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }
    return node;
  });

/**
 * 广度优先遍历树
 * @param list 列表
 * @param key 寻找的 key
 */
const findNode = (list: TreeItem[], key: string) => {
  let newList = [...list];
  for (let i = 0; i < newList.length; i++) {
    let node = newList[i];
    if (node.id === key) {
      return node;
    }
    if (node.children && node.children.length) {
      newList.push(...node.children);
    }
  }
};

function Project(props: IRouteComponentProps) {
  const { match } = props;
  // @ts-ignore
  const { id } = match.params;
  const inputRef = useRef<HTMLInputElement>();
  // 当前项目
  const [project, setProject] = useState<V1Project>({});
  // 选中的项目
  const [activeKey, setActiveKey] = useState('');
  // 新增目录是否可见
  const [visible, setVisible] = useState(false);
  // 修改目录名称是否可见
  const [editNameVisible, setEditNameVisible] = useState(false);
  // 设置树
  const [treeData, setTreeData] = useState<AnyKeyProps[]>([]);
  // 上传是否可见
  const [uploadVisible, setUploadVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  // 当前选中的节点
  const activeNode: TreeItem = useMemo(() => {
    if (treeData.length && activeKey) {
      return findNode(treeData, activeKey) || { parent_id: '0' };
    }
    return { parent_id: '0' };
  }, [treeData, activeKey]);

  /** 加载数据 */
  const loadData = async () => {
    const { item: project } = await apiGetProjectById(id);
    setProject(project || {});
  };

  /** 加载静态数据 */
  const loadAssetsData = async ({ key, children }: TreeItem) => {
    const { list = [] } = await apiQueryAssetsFile(id, { parent_id: key });
    let data = list.map((item) => {
      return {
        ...item,
        title: item.name,
        key: item.id,
        children: [],
        isLeaf: item.type !== V1ProjectAssetFileTypeEnum.DIRECTORY,
      };
    });

    if (!treeData.length || key === '0') {
      setTreeData(data);
      if (!activeKey && data.length) {
        setActiveKey(data[0].id);
      }
      return;
    }

    setTreeData((origin) =>
      updateTreeData(
        origin,
        key,
        list.map((item) => {
          return {
            ...item,
            title: item.name,
            key: item.id,
            children: [],
            isLeaf: item.type !== V1ProjectAssetFileTypeEnum.DIRECTORY,
          };
        }),
      ),
    );
  };

  const beforeSubmit = (values: FormValues) => {
    return {
      ...values,
      type: 'DIRECTORY',
      projectId: id,
      parent_id: activeKey || '0',
    };
  };

  const updateNameBeforeSubmit = (values: FormValues) => {
    return {
      ...values,
      fileId: activeKey,
      projectId: id,
    };
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
    let parent_id =
      (activeNode.type === V1ProjectAssetFileTypeEnum.DIRECTORY
        ? activeNode.id
        : activeNode.parent_id) || '0';
    for (let i = 0; i < list.length; i++) {
      let file = list[i];
      const { name, object_key } = await handleSaveFile(file);
      await apiCreateAssetsFile({
        type: 'FILE',
        projectId: id,
        parent_id,
        object_key,
        name: name,
      });
    }
    setUploading(false);
    loadAssetsData({ key: parent_id });
  };

  useMount(() => {
    loadData();
    loadAssetsData({ key: '0' });
  });

  return (
    <div className="project-tree" onDragEnter={(e) => setUploadVisible(true)}>
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
      <h2 className="project-tree-title">
        【{project.slug}】{project.name}
        <ProjectAction
          file={activeNode}
          projectId={id}
          onUpload={(file) => handleSaveFile(file)}
          openUpload={() => {
            inputRef.current?.click();
          }}
          refresh={(file) => {
            loadAssetsData(file);
          }}
        />
      </h2>
      <div className="project-tree-main">
        <SplitPane
          split="vertical"
          defaultSize={300}
          minSize={200}
          maxSize={800}
        >
          <div className="project-tree-side">
            <DirectoryTree
              treeData={treeData}
              defaultExpandAll
              blockNode
              selectedKeys={[activeKey]}
              onSelect={(selectedKeys, item) =>
                setActiveKey(item.node.key as string)
              }
              loadData={loadAssetsData}
            />
          </div>
          <div className="project-tree-content">
            <FileContent
              file={activeNode}
              refresh={() => {
                loadAssetsData({ key: activeNode?.parent_id });
              }}
            />
          </div>
        </SplitPane>
      </div>
      <AyDialogForm
        title="添加目录"
        visible={visible}
        fields={fields}
        addApi={apiCreateAssetsFile}
        beforeSubmit={beforeSubmit}
        onSuccess={() => {
          loadAssetsData(activeNode ? activeNode : { key: '0' });
        }}
        onClose={() => setVisible(false)}
      />
      <AyDialogForm
        title="修改目录名称"
        visible={editNameVisible}
        fields={fields}
        addApi={apiUpdateMenuName}
        beforeSubmit={updateNameBeforeSubmit}
        initialValues={{
          name: activeNode?.name,
        }}
        onSuccess={() => {
          loadAssetsData({ key: activeNode?.parent_id });
        }}
        onClose={() => setEditNameVisible(false)}
      />
    </div>
  );
}

export default Project;
