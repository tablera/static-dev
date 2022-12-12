import { imgExtension } from './constant';
import { TreeItem } from './type';

/**
 * 判断是否是图片
 * @param file 节点树
 */
export const isImage = (file: TreeItem) => {
  const url = file.public_url || '';
  const extension = url.split('.').slice(-1)[0];
  return imgExtension.includes(extension);
};
