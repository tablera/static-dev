import { apiCreateProject, apiQueryProjectList } from '@/api/project';
import { V1Project } from '@/swagger/dev/data-contracts';
import { AyAction, AyDialogForm } from 'amiya';
import { Menu, MenuProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';

const fields = [
  {
    title: '名称',
    key: 'name',
  },
  {
    title: '英文名称',
    key: 'slug',
  },
  {
    title: '状态',
    key: 'status',
    type: 'status-switch',
  },
];

interface Props {
  onChange: () => {};
}

function Project(props: Props) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<V1Project[]>([]);

  const items: MenuProps['items'] = useMemo(() => {
    return data.map((item) => {
      return {
        label: item.name || '',
        key: item.id || '',
      };
    });
  }, [data]);

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
  };

  const loadData = async () => {
    const { list = [] } = await apiQueryProjectList({});
    setData(list);
    if (list.length) {
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <Menu
        onClick={onClick}
        style={{ width: 256 }}
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        mode="inline"
        items={items}
      />
      <AyAction action="add" onClick={() => setVisible(true)}>
        新增项目
      </AyAction>
      <AyDialogForm
        fields={fields}
        visible={visible}
        addApi={apiCreateProject}
        onClose={() => setVisible(false)}
      />
    </div>
  );
}

export default Project;
