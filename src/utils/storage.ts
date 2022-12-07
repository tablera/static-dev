import { AnyKeyProps } from 'amiya';

/**
 * 处理对象缓存, 基本类型禁止使用(get,update)
 */
const set = (key: string, value: AnyKeyProps) => {
  localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
};

const get = (key: string): AnyKeyProps => {
  return JSON.parse(localStorage.getItem(key) || '{}');
};

const update = (key: string, value: AnyKeyProps) => {
  const data = get(key);
  Object.assign(data, value);
  localStorage.setItem(key, JSON.stringify(data));
};

export default {
  set,
  get,
  update,
};
