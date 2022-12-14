import {
  V1CreateProjectAssetFileResponse,
  V1DeleteProjectAssetFileResponse,
  V1QueryProjectAssetFileResponse,
  V1QueryProjectAssetFileVersionResponse,
  V1RenameProjectAssetFileResponse,
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
): Promise<V1CreateProjectAssetFileResponse> => {
  return post(
    `/api/dev/project/${params.projectId}/asset_file`,
    omitObj(params, 'projectId'),
  );
};

/** 重命名资源名称 */
export const apiUpdateAssetsName = (
  params: FormValues,
): Promise<V1RenameProjectAssetFileResponse> =>
  post(
    `/api/dev/project/${params.projectId}/asset_file/${params.fileId}/action/rename`,
    omitObj(params, ['projectId', 'fileId']),
  );

/** 删除项目资源 */
export const apiDeleteAssetsFile = (
  params: FormValues,
): Promise<V1DeleteProjectAssetFileResponse> =>
  remove(`/api/dev/project/${params.projectId}/asset_file/${params.fileId}`);

/** 替换项目资源 */
export const apiReplaceAssetsFile = (params: FormValues): Promise<any> =>
  post(
    `/api/dev/project/${params.projectId}/asset_file/${params.fileId}/action/replace`,
    { object_key: params.object_key },
  );

/** 查看历史版本 */
export const apiGetAssetsFileVersion = (
  params: FormValues,
): Promise<V1QueryProjectAssetFileVersionResponse> =>
  get(
    `/api/dev/project/${params.projectId}/asset_file/${params.fileId}/version`,
    omitObj(params, ['projectId', 'fileId']),
  );
