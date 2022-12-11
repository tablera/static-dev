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
import { AyDialogForm, AyFormField, FormValues } from 'amiya';
import {
  apiCreateAssetsFile,
  apiDeleteAssetsFile,
  apiQueryAssetsFile,
  apiUpdateMenuName,
} from '@/api/assets-file';
import { apiUploadImg } from '@/api';
import Compressor from 'compressorjs';
import DirectoryTree from 'antd/lib/tree/DirectoryTree';
import FileContent from './components/FileContent';
import ProjectAction from './components/ProjectAction';
import SplitPane from 'react-split-pane';
import { TreeItem } from './type';
import { message, Modal, Popover } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import FileDiffer from './components/FileDiffer';
import copy from 'copy-to-clipboard';

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
const toTreeNode = (file: V1ProjectAssetFile): TreeItem => {
  return {
    ...file,
    title: file.name,
    key: file.id + '',
    // @ts-ignore
    children: file?.children || [],
    isLeaf: file.type !== V1ProjectAssetFileTypeEnum.DIRECTORY,
  };
};

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
const updateTreeData = (
  list: TreeItem[],
  key?: string | number,
  children?: TreeItem[],
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

function Project(props: IRouteComponentProps<{ [key: string]: string }>) {
  const { match } = props;
  const { id, fileId } = match.params;
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
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  // 展开的节点 id
  const [expandedKeys, setExpandedKeys] = useState<(string | number)[]>([]);
  // 上传是否可见
  const [uploadVisible, setUploadVisible] = useState(false);
  // 是否正在上传中
  const [uploading, setUploading] = useState(false);
  // 右键弹窗是否可见
  const [poperActionVisible, setPoperActionVisible] = useState(false);
  // 文件版本是否可见
  const [fileDifferVisible, setFileDifferVisible] = useState(false);
  // 当前选中的节点
  const activeNode: TreeItem = useMemo(() => {
    if (treeData.length && activeKey) {
      return findNode(treeData, activeKey) || { parent_id: '0' };
    }
    return { parent_id: '0', key: '', id: '', label: '' };
  }, [treeData, activeKey]);

  /** 加载数据 */
  const loadData = async () => {
    const { item: project } = await apiGetProjectById(id);
    setProject(project || {});
  };

  const init = async () => {
    if (!fileId) {
      loadAssetsData({ key: 0 });
      return;
    }
    // 加载自己当前文件
    const { list = [] } = await apiQueryAssetsFile(id, { id_in: [fileId] });
    // 当前文件
    const self = toTreeNode(list[0]);

    let expandedKeys: string[] = [self.id || ''];

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
        expandedKeys.push(parent.id + '');

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
        parent.children = brothers.map((item) => toTreeNode(item));

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
        tree = list.map((item) => toTreeNode(item));
      }
    }
    // 设置树数据
    setTreeData(tree);
    // 设置展开的层级
    setExpandedKeys(expandedKeys);
    // 设置选中的节点
    setActiveKey(self.key + '');
  };

  /** 加载静态数据 */
  const loadAssetsData = async ({ key, children }: TreeItem) => {
    const { list = [] } = await apiQueryAssetsFile(id, { parent_id: key });
    let data = list
      .map((item) => toTreeNode(item))
      .sort((a, b) => {
        if (a.type === b.type) {
          return a > b ? -1 : 1;
        }

        if (a.type === V1ProjectAssetFileTypeEnum.DIRECTORY) {
          return -1;
        }

        return 1;
      });

    if (!treeData.length || key === '0') {
      setTreeData(data.map((item) => toTreeNode(item)));
      return;
    }

    setTreeData((origin) =>
      updateTreeData(
        origin,
        key,
        list.map((item) => toTreeNode(item)),
      ),
    );
  };

  /**
   * 复制文件链接
   */
  const handleCopy = () => {
    copy(activeNode.public_url || '');
    message.success('复制成功');
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

  /**
   * 删除资源
   */
  const onDeleteAssets = (file: TreeItem) => {
    Modal.confirm({
      title: '删除提示',
      content: '确定要删除这个文件吗？',
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        await apiDeleteAssetsFile({
          fileId: file.id,
          projectId: file.project_id,
        });
        loadAssetsData({ key: file.parent_id + '' });
        setActiveKey('');
        message.success('删除成功');
      },
    });
  };

  const selectNode = (key: string) => {
    setActiveKey(key);
    if (key) {
      history.push(`/project/${id}/file/${key}`);
    } else {
      history.push(`/project/${id}`);
    }
  };

  useMount(() => {
    // 加载项目数据
    loadData();
    init();
  });

  useEffect(() => {
    setActiveKey(fileId + '');
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
          file={activeNode}
          projectId={id}
          onUpload={(file) => handleSaveFile(file)}
          openUpload={() => {
            inputRef.current?.click();
          }}
          refresh={(file) => {
            loadAssetsData(file);
          }}
          onNewFile={(id) => {
            setActiveKey(id);
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
              blockNode
              selectedKeys={[activeKey]}
              expandedKeys={expandedKeys}
              onExpand={(expandedKeys) => setExpandedKeys(expandedKeys)}
              onSelect={(selectedKeys, item) => selectNode(item.node.key + '')}
              titleRender={(node: TreeItem) => {
                return (
                  <Popover
                    open={poperActionVisible && node.id === activeKey}
                    onOpenChange={setPoperActionVisible}
                    content={
                      <div className="project-poper-action-wrap">
                        <div
                          className="project-poper-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy();
                            setPoperActionVisible(false);
                          }}
                        >
                          复制文件链接
                        </div>
                        <div
                          className="project-poper-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditNameVisible(true);
                            setPoperActionVisible(false);
                          }}
                        >
                          修改名称
                        </div>
                        <div
                          className="project-poper-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileDifferVisible(true);
                            setPoperActionVisible(false);
                          }}
                        >
                          查看历史版本
                        </div>
                        <div
                          className="project-poper-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAssets(node);
                            setPoperActionVisible(false);
                          }}
                        >
                          删除
                        </div>
                      </div>
                    }
                    trigger={['contextMenu']}
                    placement="bottom"
                  >
                    <div style={{ width: '100%' }}>{node.name}</div>
                  </Popover>
                );
              }}
              onRightClick={({ node }) => {
                setActiveKey(node.key + '');
              }}
              loadData={loadAssetsData}
            />
            <div
              className="project-tree-side-extra"
              onClick={() => selectNode('')}
            ></div>
          </div>
          <div className="project-tree-content">
            <FileContent
              file={activeNode}
              onDeleteAssets={onDeleteAssets}
              onViewVersion={() => setFileDifferVisible(true)}
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
        title="新建文件夹"
        visible={visible}
        fields={fields}
        addApi={(params) => {
          return apiCreateAssetsFile({
            parent_id: activeKey || '0',
            ...params,
          });
        }}
        beforeSubmit={beforeSubmit}
        onSuccess={() => {
          loadAssetsData(activeNode ? activeNode : { key: '0' });
        }}
        onClose={() => setVisible(false)}
      />
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
          loadAssetsData({ key: activeNode?.parent_id + '' });
        }}
        onClose={() => setEditNameVisible(false)}
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
