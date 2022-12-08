import {
  V1CreateProjectAssetFileResponse,
  V1QueryProjectAssetFileResponse,
} from '@/swagger/dev/data-contracts';
import { get, post, put, remove } from '@/utils/ajax';
import omitObj from '@/utils/omitObj';
import { AnyKeyProps, FormValues } from 'amiya';

/** 查询项目列表 */
export const apiQueryAssetsFile = (
  id: string,
  params: FormValues,
): Promise<V1QueryProjectAssetFileResponse> =>
  get(`/api/dev/project/${id}/asset_file`, params);

/** 新增项目资源 */
export const apiCreateAssetsFile = (
  params: FormValues,
): Promise<V1CreateProjectAssetFileResponse> =>
  post(
    `/api/dev/project/${params.projectId}/asset_file`,
    omitObj(params, 'projectId'),
  );

/** 重命名目录名称 */
export const apiUpdateMenuName = (params: FormValues): Promise<v> =>
  post(
    `/api/dev/project/${params.projectId}/asset_file/${params.fileId}/action/rename`,
    omitObj(params, ['projectId', 'fileId']),
  );

/** 删除项目资源 */
export const apiDeleteAssetsFile = (params: FormValues): Promise<any> =>
  remove(`/api/dev/project/${params.projectId}/asset_file/${params.fileId}`);
