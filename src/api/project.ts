import {
  V1CreateProjectResponse,
  V1GetProjectByIdResponse,
  V1QueryProjectResponse,
  V1UpdateProjectResponse,
} from '@/swagger/dev/data-contracts';
import { get, post, put } from '@/utils/ajax';
import { FormValues } from 'amiya';
import omitObj from '@/utils/omitObj';

/** 查询项目列表 */
export const apiQueryProjectList = (
  params: FormValues,
): Promise<V1QueryProjectResponse> => get('/api/dev/project', params);

/** 新增项目 */
export const apiCreateProject = (
  params: FormValues,
): Promise<V1CreateProjectResponse> => post('/api/dev/project', params);

/** 修改项目 */
export const apiUpdateProject = (
  params: FormValues,
): Promise<V1UpdateProjectResponse> =>
  put(`/api/dev/project/${params.id}`, omitObj(params, 'id'));

/** 查询项目 */
export const apiGetProjectById = (
  id: string,
): Promise<V1GetProjectByIdResponse> => get(`/api/dev/project/${id}`);
