import { AnyKeyProps } from 'amiya';

/**
 * 复制一个对象，并删除某些 key
 * @param obj 复制对象
 * @param key 要删除的 key，可以是数组
 * @returns 删除了 key 的对象
 */
const omitObj = (obj: AnyKeyProps, key: string | Array<string>) => {
  let result = { ...obj };
  if (typeof key === 'string') {
    delete result[key];
  } else if (Array.isArray(key)) {
    key.forEach((k) => delete result[k]);
  }
  return result;
};

export default omitObj;
