import { apiCreateProject, apiQueryProjectList } from '@/api/project';
import { V1Project } from '@/swagger/dev/data-contracts';
import './index.less';
import { AyAction, AyCtrl, AySearchTable, AySearchTableField } from 'amiya';
import { history } from 'umi';

const fields: AySearchTableField[] = [
  {
    title: '名称',
    key: 'name',
    dialog: {
      required: true,
    },
    table: {
      render: (name: string, project: V1Project) => {
        return (
          <a onClick={() => history.push(`/project/${project.id}`)}>{name}</a>
        );
      },
    },
  },
  {
    title: '标志',
    key: 'slug',
    dialog: {
      required: true,
    },
  },
  {
    title: '备注',
    key: 'description',
    renderType: 'ellipsis',
    width: 300,
    dialog: {
      type: 'textarea',
      required: true,
    },
  },
  {
    title: '状态',
    key: 'status',
    renderType: 'status-switch',
    dialog: {
      type: 'status-switch',
    },
  },
];

function home() {
  const ctrl = {
    render: (name: string, project: V1Project) => {
      return (
        <AyCtrl>
          <AyAction
            onClick={() => history.push(`/project/${project.id}/file/0`)}
          >
            资源管理
          </AyAction>
        </AyCtrl>
      );
    },
  };

  return (
    <div>
      <AySearchTable
        fields={fields}
        title="项目列表"
        ctrl={ctrl}
        api={apiQueryProjectList}
        dialogFormExtend={{
          fields,
          addApi: apiCreateProject,
        }}
      >
        <AyAction action="add">新增项目</AyAction>
      </AySearchTable>
    </div>
  );
}

export default home;
