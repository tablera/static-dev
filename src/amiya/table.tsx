import { AnyKeyProps, registerTableRender, setTableDefaultProps } from 'amiya';
import { Switch, Typography, Image, Tooltip } from 'antd';
import { formatDatetime, renderStatus } from '@/utils';
import Storage from '@/utils/storage';
import { getLangLabel } from './fields';
const { Paragraph } = Typography;

setTableDefaultProps({
  bordered: false,
});

/**
 * 1
 * @decs 复制列
 *
 * @returns ReactNode
 */
registerTableRender('copy', ({ text }: AnyKeyProps) => {
  return (
    <Paragraph copyable style={{ marginBottom: 0 }}>
      {text}
    </Paragraph>
  );
});

/**
 * 2
 * @decs 时间显示格式化
 *
 * @params time
 *
 * @returns format time
 */
registerTableRender('datetime', ({ text }: AnyKeyProps) =>
  formatDatetime(text),
);

/**
 * 3
 * @decs 状态加文字
 *
 * @returns ReactNode
 */
registerTableRender('status-text', ({ text, field }: AnyKeyProps) => {
  const { options = [] } = field;
  return renderStatus(text, options);
});

/**
 * 3
 * @decs 金额
 *
 * @returns ReactNode
 */
registerTableRender('price', ({ text, field }: AnyKeyProps) => {
  if (!text) return '';
  // 保留两位
  return '¥' + (+text / 100).toFixed(2);
});

/**
 * 4
 * @decs 状态
 *
 * @returns ReactNode
 */
registerTableRender('status-switch', ({ text, field }: AnyKeyProps) => {
  return <Switch checked={text === 'NORMAL'} disabled {...field.props} />;
});

/**
 * 5
 * @decs 溢出省略
 *
 * @returns ReactNode
 */
registerTableRender('ellipsis', ({ text, field }: AnyKeyProps) => {
  return (
    <Tooltip title={text}>
      <div className="ellipsis">{text}</div>
    </Tooltip>
  );
});
