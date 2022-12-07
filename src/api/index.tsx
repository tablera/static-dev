import { get, postWithFile } from '@/utils/ajax';
import { AnyKeyProps } from 'amiya';

export const emptyApi = (): Promise<any> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, 300);
  });

export const apiUploadImg = (params: AnyKeyProps): Promise<AnyKeyProps> =>
  postWithFile('/api/../upload/action/simple-upload', params);
