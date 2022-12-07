import { V1Project } from '@/swagger/dev/data-contracts';
import { AyCardGroup, AyDialog, AySearchTable, AySelect } from 'amiya';
import { useMemo, useState } from 'react';

interface Props {
  visible: boolean;
  onClose: () => void;
  data: V1Project[];
}

const fields = [
  {
    title: '项目名称',
    key: 'name',
  },
  {
    title: '状态',
    key: '',
  },
];

function ProjectSelect(props: Props) {
  const { visible, onClose, data } = props;
  const [active, setActive] = useState('');

  const options = useMemo(() => {
    return data.map((project) => {
      return {
        label: project.name,
        value: project.id,
      };
    });
  }, [data]);

  return (
    <AyDialog title="项目选择" visible={visible} onClose={onClose}>
      <AySearchTable compact data={data} fields={fields} />
    </AyDialog>
  );
}

export default ProjectSelect;
