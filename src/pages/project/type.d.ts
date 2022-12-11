import { V1ProjectAssetFile } from '@/swagger/dev/data-contracts';

export interface TreeItem extends V1ProjectAssetFile {
  /** 标题 */
  title?: string;
  /** 唯一 key */
  key: string | number;
  /** 是否是子节点 */
  isLeaf?: boolean;
  /** 子元素 */
  children?: TreeItem[];
}
