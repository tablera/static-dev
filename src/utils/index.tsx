import { AnyKeyProps, Option } from 'amiya';
import moment from 'moment';
import { Badge, Tag } from 'antd';

export const getRandom = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * 格式化时间
 * @param time 时间
 * @returns
 */
export const formatDatetime = (time: number) => {
  if (!time) return null;
  return moment(time).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * @desc渲染一个带颜色的状态
 *
 * @param status 状态值
 * @param options 选项
 *
 * @returns ReactNode
 */
export const renderStatus = (
  status: string | number,
  options: Option[],
  type: 'badge' | 'tag' = 'badge',
) => {
  const selectOption: Option = options.filter(
    ({ value }: AnyKeyProps) => value === status,
  )[0];

  if (!selectOption || !selectOption.label) {
    return status;
  }

  if (!selectOption.color && !selectOption.status) {
    return selectOption.label;
  }

  return (
    <div>
      {type === 'badge' ? (
        <Badge
          color={selectOption.color}
          status={selectOption.status}
          text={selectOption.label}
        />
      ) : (
        <Tag color={selectOption.color}>{selectOption.label}</Tag>
      )}
    </div>
  );
};

export const getValueByOptions = (value: any, options: Array<Option>) => {
  let option = options.find((option) => option.value === value);
  if (option && (option.color || option.status)) {
    return (
      <Badge color={option.color} text={option.label} status={option.status} />
    );
  }
  return option ? option.label : value;
};

export const copy = (data: any) => JSON.parse(JSON.stringify(data));

export const formatAmount = (amount?: number | string) => {
  return Number(amount || 0).toFixed(2);
};
