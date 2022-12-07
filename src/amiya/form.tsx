import UploadImage from '@/components/UploadImage';
import AnyKeyProps from '@/types/AnyKeyProps';
import { registerField } from 'amiya';
import { InputNumber, TimePicker, Switch } from 'antd';

// 1. 注册金额数字框
registerField('price', {
  type: 'price',
  defaultValue: null,
  render: ({ field, readonly, getFieldValue }: AnyKeyProps) => {
    let text = getFieldValue(field.key);
    return readonly ? (
      <span className="ay-form-text">¥{text || text === 0 ? text : '-'}</span>
    ) : (
      <InputNumber
        placeholder={`请输入${field.title || ''}`}
        className="max-width"
        disabled={readonly}
        min={0}
        max={99999999}
        {...field.props}
      />
    );
  },
});

// 2. 图片上传
registerField('upload-image', {
  type: 'upload-image',
  defaultValue: '',
  render: ({ field, readonly, getFieldValue }: AnyKeyProps) => {
    return <UploadImage readonly={readonly} {...field.props} />;
  },
});

// 3. 时间选择框
registerField('time', {
  type: 'time',
  defaultValue: null,
  render: ({ field }) => <TimePicker {...field.props} />,
});

interface StatusSwitchProps {
  value?: any;
  onChange?: (value: any) => void;
  [key: string]: any;
}

export const StatusSwitch = (props: StatusSwitchProps) => {
  const { value, onChange, ...otherProps } = props;
  return (
    <Switch
      {...otherProps}
      checked={value === 'NORMAL'}
      onChange={(v) => onChange && onChange(value === 'NORMAL' ? 'DISABLED' : 'NORMAL')}
    />
  );
};

// 4. 状态开关
registerField('status-switch', {
  type: 'status-switch',
  defaultValue: 'NORMAL',
  render: ({ field, readonly }: AnyKeyProps) => {
    return <StatusSwitch disabled={readonly} {...field.props} />;
  },
});
