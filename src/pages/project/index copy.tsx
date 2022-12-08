import { apiGetProjectById } from '@/api/project';
import { V1Project, V1ProjectAssetFile } from '@/swagger/dev/data-contracts';
import { useMount } from 'ahooks';
import { Button, Popover, Space, Upload } from 'antd';
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

const updateTreeData = (
  list: TreeItem[],
  key: React.Key,
  children: TreeItem[],
): TreeItem[] =>
  list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children: children.filter((item) => item.type === 'DIRECTORY'),
        fileChildren: children.filter((item) => item.type === 'FILE'),
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

const findNode = (list: TreeItem[], key: string) => {
  for (let i = 0; i < list.length; i++) {
    let node = list[i];
    if (node.key === key) {
      return node;
    } else if (node.children && node.children.length) {
      return findNode(node.children, key);
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
  // 上传加载中
  const [uploadLoading, setUploadLoading] = useState(false);
  // 目录编辑模式 add update
  const [menuMode, setMenuMode] = useState<string>('add');
  // 当前选中的节点
  const activeNode: TreeItem = useMemo(() => {
    if (treeData.length && activeKey) {
      return findNode(treeData, activeKey) || { parent_id: '0' };
    }
  }, [treeData, activeKey]);
  // 文件列表
  const fileList = useMemo(() => {
    return activeNode?.fileChildren || [];
  }, [activeNode]);

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
        fileChildren: [],
        isLeaf: false,
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
            fileChildren: [],
            isLeaf: false,
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

  const beforeUpload = async (file: File, list: Array<File>) => {
    setUploadLoading(true);
    for (let i = 0; i < list.length; i++) {
      let file = list[i];
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

      await apiCreateAssetsFile({
        type: 'FILE',
        projectId: id,
        parent_id: activeKey,
        object_key,
        name: name,
      });
    }
    setUploadLoading(false);
    loadAssetsData(activeNode);
    return false;
  };

  useMount(() => {
    loadData();
    loadAssetsData({ key: '0' });
  });

  return (
    <div>
      <h2 className="project-title">
        【{project.slug}】{project.name}
      </h2>
      <div className="project-desc">{project.description}</div>
      <div className="project-main">
        <div className="project-side">
          <div className="project-side-header">
            {project.slug}
            <div>
              <Space>
                <EditOutlined
                  onClick={() => {
                    setEditNameVisible(true);
                  }}
                />
                <FolderAddOutlined
                  onClick={() => {
                    setVisible(true);
                  }}
                />
              </Space>
            </div>
          </div>
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
          {!treeData.length && (
            <div
              className="project-side-empty"
              onClick={() => setVisible(true)}
            >
              添加第一个目录
            </div>
          )}
        </div>
        <div className="project-content">
          <div className="assets-content">
            {activeKey ? (
              <Upload.Dragger
                multiple
                beforeUpload={beforeUpload}
                showUploadList={false}
              >
                <div className="assets-upload" style={{ width: '100%' }}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    点击图片上传，或将图片拖拽到此处。
                  </p>
                </div>
              </Upload.Dragger>
            ) : (
              <div></div>
            )}
            {fileList.length > 0 && (
              <h2 className="assets-title">已上传文件</h2>
            )}
            <ul className="assets-list">
              {fileList?.map((file) => (
                <FileItem file={file} key="file.id" />
              ))}
            </ul>
          </div>
        </div>
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
