import { apiGetProjectById } from '@/api/project';
import {
  V1Project,
  V1ProjectAssetFile,
  V1ProjectAssetFileTypeEnum,
} from '@/swagger/dev/data-contracts';
import { useMount } from 'ahooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IRouteComponentProps, history } from 'umi';
import './index.less';
import { AyDialog, AyDialogForm, AyFormField, FormValues } from 'amiya';
import {
  apiCreateAssetsFile,
  apiDeleteAssetsFile,
  apiQueryAssetsFile,
  apiUpdateAssetsName,
} from '@/api/assets-file';
import { apiUploadImg } from '@/api';
import Compressor from 'compressorjs';
import DirectoryTree from 'antd/lib/tree/DirectoryTree';
import FileContent from './components/FileContent';
import ProjectAction from './components/ProjectAction';
import SplitPane from 'react-split-pane';
import { TreeItem } from './type';
import { Dropdown, message, Modal } from 'antd';
import { ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons';
import FileDiffer from './components/FileDiffer';
import copy from 'copy-to-clipboard';
import mime from 'mime-types';
import ImageChange from './components/ImageChange';
import { isImage } from './util';
import ImageDiffer from './components/ImageDiffer';

const fields: AyFormField[] = [
  {
    key: 'name',
    placeholder: '请输入资源名称',
    span: 24,
  },
];

/**
 * 转树的节点
 * @param file 静态资源
 */
function toTreeNode(file: V1ProjectAssetFile): TreeItem {
  return {
    ...file,
    title: file.name,
    key: file.id + '',
    // @ts-ignore
    children: file?.children || [],
    isLeaf: file.type !== V1ProjectAssetFileTypeEnum.DIRECTORY,
  };
}

/**
 * 压缩文件
 * @param file 文件
 */
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

/**
 * 修改节点的子元素
 * @param list 数据树
 * @param key 需要修改节点的 key
 * @param children 节点的子列表
 */
function updateTreeData(
  list: TreeItem[],
  key?: string | number,
  children?: TreeItem[],
): TreeItem[] {
  return list.map((node) => {
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
}

/**
 * 广度优先遍历树
 * @param list 列表
 * @param key 寻找的 key
 */
function findNode(list: TreeItem[], key: string) {
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
}

/**
 * 排序文件
 * @param a 第一个文件
 * @param b 第二个文件
 */
function sortAssets(list: TreeItem[]) {
  let newList: TreeItem[] = [];
  list.forEach((item) => {
    if (item.type === V1ProjectAssetFileTypeEnum.DIRECTORY) {
      newList.unshift(item);
    } else {
      newList.push(item);
    }
  });
  return newList;
}

function Project(props: IRouteComponentProps<{ [key: string]: string }>) {
  const { match } = props;
  const { id, fileId } = match.params;
  const inputRef = useRef<HTMLInputElement>();
  // 当前项目
  const [project, setProject] = useState<V1Project>({});
  // 选中的项目
  const [activeKey, setActiveKey] = useState('');
  // 新增是否可见
  const [addVisible, setAddVisible] = useState(false);
  // 新增文件是否可见
  const [addFileVisible, setAddFileVisible] = useState(false);
  // 修改目录名称是否可见
  const [editNameVisible, setEditNameVisible] = useState(false);
  // 设置树
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  // 展开的节点 id
  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>([]);
  // 已经加载的节点
  const [loadedKeys, setLoadedKeys] = useState<string[]>([]);
  // 上传是否可见
  const [uploadVisible, setUploadVisible] = useState(false);
  // 是否正在上传中
  const [uploading, setUploading] = useState(false);
  // 文件版本是否可见
  const [fileDifferVisible, setFileDifferVisible] = useState(false);
  // 列表展示类型
  const [listType, setListType] = useState('icon');
  // 图片替换展示
  const [imageChangeVisible, setImageChangeVisible] = useState(false);
  // 当前选中的节点
  const activeNode: TreeItem = useMemo(() => {
    if (treeData.length && activeKey) {
      return findNode(treeData, activeKey) || { parent_id: '0' };
    }
    return { parent_id: '0', key: '', id: '', label: '' };
  }, [treeData, activeKey]);

  /** 创建新文件 */
  const apiCreateNewFile = async (values: FormValues): Promise<any> => {
    const newFile = new File([], values.name, {
      type: mime.lookup(values.name) || 'text/plain',
    });

    const { name, object_key } = await handleSaveFile(newFile);
    let parent_id =
      (activeNode.type === V1ProjectAssetFileTypeEnum.DIRECTORY
        ? activeNode.id
        : activeNode.parent_id) || '0';
    const { id: activeKey = '' } = await apiCreateAssetsFile({
      ...values,
      type: 'FILE',
      object_key,
      name,
      projectId: activeNode.project_id || id,
      parent_id,
    });
    setActiveKey(activeKey);
  };

  /** 加载数据 */
  const loadData = async () => {
    const { item: project } = await apiGetProjectById(id);
    setProject(project || {});
  };

  /** 首次加载，加载到当前节点的数据 */
  const init = async () => {
    setTreeData([]);
    setExpandedKeys([]);
    setLoadedKeys([]);
    if (fileId === '0') {
      loadAssetsData({ key: '0' });
      return;
    }
    // 加载自己当前文件
    const { list = [] } = await apiQueryAssetsFile(id, { id_in: [fileId] });
    // 当前文件
    const self = toTreeNode(list[0]);

    let expandedKeys: string[] = [self.id || ''];
    let loadedKeys: string[] = [];

    let tree = [self];
    await loop(self);

    /**
     * 递归一直加载到 parent_id 0 位置的数据
     * @param file 当前节点
     */
    async function loop(file: TreeItem) {
      // 非顶层数据加载
      if (file.parent_id !== '0') {
        const { list = [] } = await apiQueryAssetsFile(id, {
          id_in: file.parent_id,
        });
        // 父层级
        const parent = toTreeNode(list[0]);
        expandedKeys.push(parent.id || '');
        loadedKeys.push(parent.id || '');

        // 加载兄弟数据
        let { list: brothers = [] } = await apiQueryAssetsFile(id, {
          parent_id: file.parent_id,
        });

        // 在兄弟列表替换自己
        brothers.find((item, index) => {
          if (item.id === file.id) {
            brothers[index] = file;
          }
        });
        // 设置父层级的子数据
        parent.children = sortAssets(brothers.map((item) => toTreeNode(item)));

        tree = [parent];
        await loop(parent);
      } else {
        // 最顶层数据加载
        let { list = [] } = await apiQueryAssetsFile(id, {
          parent_id: '0',
        });
        list.find((item, index) => {
          if (item.id === file.id) {
            list[index] = file;
          }
        });
        tree = sortAssets(list.map((item) => toTreeNode(item)));
      }
    }
    // 设置树数据
    setTreeData(tree);
    // 设置展开的层级
    setExpandedKeys(expandedKeys);
    // 设置选中的节点
    setActiveKey(self.key + '');
    // 已经加载过的
    setLoadedKeys(loadedKeys);
  };

  /** 加载静态数据 */
  const loadAssetsData = async ({ key, children }: TreeItem) => {
    const { list = [] } = await apiQueryAssetsFile(id, { parent_id: key });
    let data = sortAssets(list.map((item) => toTreeNode(item)));

    if (!treeData.length || key === '0') {
      setTreeData(data.map((item) => toTreeNode(item)));
      setLoadedKeys(['0']);
      return;
    }

    setTreeData((origin) =>
      updateTreeData(
        origin,
        key,
        sortAssets(list.map((item) => toTreeNode(item))),
      ),
    );

    setLoadedKeys([...loadedKeys, key.toString()]);
  };

  /**
   * 复制文件链接
   */
  const handleCopy = () => {
    copy(activeNode.public_url || '');
    message.success('复制成功');
  };

  const addFileBeforeSubmit = (values: FormValues) => {
    let name = values.name;
    if (name.split('.').length <= 1) {
      message.info('请输入资源后缀名');
      return false;
    }
    return values;
  };

  const addMenuBeforeSubmit = (values: FormValues) => {
    return {
      ...values,
      type: 'DIRECTORY',
      projectId: id,
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
      public_url: res.public_url,
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

  /**
   * 删除资源
   */
  const onDeleteAssets = (file: TreeItem) => {
    Modal.confirm({
      title: '删除提示',
      content: '确定要删除这个文件/文件夹吗？',
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        await apiDeleteAssetsFile({
          fileId: file.id,
          projectId: file.project_id,
        });
        loadAssetsData({ key: file.parent_id + '' });
        selectNode(file.parent_id || '0');
        message.success('删除成功');
      },
    });
  };

  /**
   * 选中一个节点
   * @param key 选中节点的 key
   */
  const selectNode = (key: string) => {
    setActiveKey(key);
    if (key) {
      history.push(`/project/${id}/file/${key}`);
    } else {
      history.push(`/project/${id}/file/0`);
    }
  };

  useMount(() => {
    // 加载项目数据
    loadData();
    init();
  });

  useEffect(() => {
    setActiveKey(fileId || '0');
  }, [props.location]);

  return (
    <div className="project-tree" onDragEnter={(e) => setUploadVisible(true)}>
      <input
        type="file"
        onInput={(e) => handleUpload(e?.target?.files)}
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
            onInput={(e) => handleUpload(e?.target?.files)}
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
        <div className="project-tree-name" onClick={() => selectNode('')}>
          【{project.slug}】{project.name}
        </div>
        <ProjectAction
          openUpload={() => {
            inputRef.current?.click();
          }}
          onAddFile={() => setAddFileVisible(true)}
          onAddMenu={() => setAddVisible(true)}
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
            <Dropdown
              menu={{
                items:
                  activeNode.type === V1ProjectAssetFileTypeEnum.FILE
                    ? [
                        {
                          label: '复制文件链接',
                          key: 'copy',
                          onClick: () => handleCopy(),
                        },
                        isImage(activeNode) && {
                          label: '图片替换',
                          key: 'imageChange',
                          onClick: () => setImageChangeVisible(true),
                        },
                        {
                          label: '修改名称',
                          key: 'updateName',
                          onClick: () => setEditNameVisible(true),
                        },
                        {
                          label: '查看历史版本',
                          key: 'version',
                          onClick: () => {
                            setFileDifferVisible(true);
                          },
                        },
                        {
                          type: 'divider',
                        },
                        {
                          label: '删除',
                          key: 'delete',
                          danger: true,
                          onClick: () => onDeleteAssets(activeNode),
                        },
                      ]
                    : [
                        {
                          label: '修改名称',
                          key: 'updateName',
                          onClick: () => setEditNameVisible(true),
                        },
                        {
                          type: 'divider',
                        },
                        {
                          label: '新建文件',
                          key: 'addFile',
                          onClick: () => setAddFileVisible(true),
                        },
                        {
                          label: '新建文件夹',
                          key: 'addMenu',
                          onClick: () => setAddVisible(true),
                        },
                        {
                          type: 'divider',
                        },
                        {
                          label: '删除',
                          key: 'delete',
                          danger: true,
                          onClick: () => onDeleteAssets(activeNode),
                        },
                      ],
              }}
              trigger={['contextMenu']}
            >
              <DirectoryTree
                treeData={treeData}
                blockNode
                selectedKeys={[activeKey]}
                expandedKeys={expandedKeys}
                loadedKeys={loadedKeys}
                onExpand={(expandedKeys) => setExpandedKeys(expandedKeys)}
                onSelect={(selectedKeys, item) =>
                  selectNode(item.node.key.toString())
                }
                onRightClick={({ node }) => {
                  setActiveKey(node.key.toString());
                }}
                loadData={loadAssetsData}
              />
            </Dropdown>
            <Dropdown
              menu={{
                items: [
                  {
                    label: '新建文件',
                    key: 'addFile',
                    onClick: () => setAddFileVisible(true),
                  },
                  {
                    label: '新建文件夹',
                    key: 'addMenu',
                    onClick: () => setAddVisible(true),
                  },
                ],
              }}
              trigger={['contextMenu']}
            >
              <div
                className="project-tree-side-extra"
                onClick={() => selectNode('')}
                onContextMenu={() => selectNode('')}
              ></div>
            </Dropdown>
          </div>
          <div className="project-tree-content">
            <FileContent
              file={activeNode}
              onDeleteAssets={onDeleteAssets}
              onViewVersion={() => setFileDifferVisible(true)}
              listType={listType}
              onListTypeChange={setListType}
              onUpdateName={() => {
                setEditNameVisible(true);
              }}
              onCopyLink={() => handleCopy()}
              onSelect={(file) => {
                selectNode(file.key + '');
                setActiveKey(file.key + '');
                setExpandedKeys([
                  ...expandedKeys,
                  file.key,
                  ...(file.parent_id_list || []),
                ]);
                loadAssetsData({ key: file.key });
              }}
              refresh={() => {
                loadAssetsData({ key: activeNode?.parent_id || '' });
              }}
            />
          </div>
        </SplitPane>
      </div>
      <AyDialogForm
        title="新建文件"
        visible={addFileVisible}
        fields={fields}
        addApi={apiCreateNewFile}
        beforeSubmit={addFileBeforeSubmit}
        onSuccess={() => {
          let activeKey: string =
            (activeNode.type === V1ProjectAssetFileTypeEnum.FILE
              ? activeNode.parent_id
              : activeNode.key.toString()) || '0';
          loadAssetsData({
            key: activeKey,
          });
          setActiveKey(activeKey);
        }}
        onClose={() => setAddFileVisible(false)}
      />
      <AyDialogForm
        title="新建文件夹"
        visible={addVisible}
        fields={fields}
        addApi={(params) => {
          return apiCreateAssetsFile({
            parent_id:
              (activeNode.type === V1ProjectAssetFileTypeEnum.FILE
                ? activeNode.parent_id
                : activeNode.key) || '0',
            ...params,
          });
        }}
        beforeSubmit={addMenuBeforeSubmit}
        onSuccess={() => {
          loadAssetsData({
            key:
              (activeNode.type === V1ProjectAssetFileTypeEnum.FILE
                ? activeNode.parent_id
                : activeNode.key) || '0',
          });
        }}
        onClose={() => setAddVisible(false)}
      />
      <AyDialogForm
        title="修改名称"
        visible={editNameVisible}
        fields={fields}
        addApi={apiUpdateAssetsName}
        beforeSubmit={updateNameBeforeSubmit}
        initialValues={{
          name: activeNode?.name,
        }}
        onSuccess={() => {
          init();
        }}
        onClose={() => setEditNameVisible(false)}
      />
      <ImageChange
        file={activeNode}
        visible={imageChangeVisible}
        onClose={() => setImageChangeVisible(false)}
        onSaveFile={handleSaveFile}
        onSuccess={() => {
          loadAssetsData({ key: activeNode?.parent_id + '' });
        }}
      />
      <FileDiffer
        file={activeNode}
        visible={fileDifferVisible}
        onClose={() => setFileDifferVisible(false)}
        onSuccess={() => {
          loadAssetsData({ key: activeNode?.parent_id + '' });
        }}
      />
    </div>
  );
}

export default Project;
