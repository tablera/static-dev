import { apiCreateProject, apiQueryProjectList } from '@/api/project';
import { V1Project } from '@/swagger/dev/data-contracts';
import { useMount } from 'ahooks';
import { Space } from 'antd';
import { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import './index.less';
import { AyDialogForm, AyFormField } from 'amiya';
import { history } from 'umi';

const fields: AyFormField[] = [
  {
    title: '名称',
    key: 'name',
    required: true,
  },
  {
    title: '英文名称',
    key: 'slug',
    required: true,
  },
  {
    title: '备注',
    key: 'description',
    type: 'textarea',
  },
  {
    title: '状态',
    key: 'status',
    type: 'status-switch',
  },
];

function home() {
  const [projectList, setProjectList] = useState<V1Project[]>([]);
  const [visible, setVisible] = useState(false);
  const loadData = async () => {
    const { list = [] } = await apiQueryProjectList({});
    setProjectList(list);
  };

  useMount(() => {
    loadData();
  });

  return (
    <div className="home">
      <div className="home-main">
        <h2 className="home-main-title">项目列表</h2>
        <Space size="large" wrap>
          {projectList.map((project) => (
            <div
              className="home-main-project"
              onClick={() => history.push(`/project/${project.id}/tree`)}
            >
              <h3 className="home-main-project-title">
                【{project.slug}】{project.name}
              </h3>
              <div className="home-main-project-description">
                {project.description}
              </div>
            </div>
          ))}
          <div
            className="home-main-project home-main-project-add"
            onClick={() => setVisible(true)}
          >
            <PlusOutlined />
            新增项目
          </div>
        </Space>
      </div>

      <AyDialogForm
        fields={fields}
        visible={visible}
        addApi={apiCreateProject}
        onClose={() => setVisible(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}

export default home;
