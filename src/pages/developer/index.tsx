import {
  apiCreateDeveloper,
  apiQueryDeveloperList,
  apiUpdateDeveloper,
} from '@/api/developer';
import { V1Developer } from '@/swagger/dev/data-contracts';
import {
  AyAction,
  AyCtrl,
  AyFormField,
  AySearchTable,
  AySearchTableField,
  AyTableCtrlField,
  FormValues,
} from 'amiya';

const fields: AySearchTableField[] = [
  {
    title: '开发者名称',
    key: 'name',
    dialog: {
      required: true,
    },
  },
  {
    title: '类型',
    key: 'type',
    dialog: {
      defaultValue: 'HUMAN',
      type: 'radio-group',
      required: true,
      reSetting: (fields: AyFormField, mode: string) => {
        fields.readonly = mode === 'update';
        return fields;
      },
    },
    options: [
      { label: '机器人', value: 'BOT' },
      { label: '人类', value: 'HUMAN' },
    ],
  },
  {
    title: '手机号',
    key: 'phone_number',
    dialog: {
      required: true,
      reSetting: (fields: AyFormField, mode: string) => {
        fields.readonly = mode === 'update';
        return fields;
      },
    },
  },
  {
    title: '创建时间',
    key: 'create_time',
    renderType: 'datetime',
  },
  {
    title: '状态',
    key: 'status',
    dialog: {
      type: 'status-switch',
    },
    renderType: 'status-switch',
  },
];

function Developer() {
  const ctrl: AyTableCtrlField = {
    render: (value: string, record: V1Developer) => {
      return (
        <AyCtrl>
          <AyAction action="update" record={record}>
            编辑
          </AyAction>
        </AyCtrl>
      );
    },
  };

  const beforeSubmit = (values: FormValues, mode: string) => {
    if (mode === 'update') {
      return {
        id: values.id,
        status: values.status,
        name: values.name,
      };
    }
    values.country_code = '86';
    return values;
  };

  return (
    <AySearchTable
      api={apiQueryDeveloperList}
      title="开发者列表"
      fields={fields}
      ctrl={ctrl}
      dialogFormExtend={{
        fields,
        addApi: apiCreateDeveloper,
        updateApi: apiUpdateDeveloper,
        beforeSubmit,
      }}
    >
      <AyAction action="add">新增开发者</AyAction>
    </AySearchTable>
  );
}

export default Developer;
