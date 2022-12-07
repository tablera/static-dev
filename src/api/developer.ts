import {
  V1CreateDeveloperResponse,
  V1QueryDeveloperResponse,
  V1UpdateDeveloperResponse,
} from '@/swagger/dev/data-contracts';
import { get, post, put } from '@/utils/ajax';
import { FormValues } from 'amiya';
import omitObj from '@/utils/omitObj';

/** 查询开发者列表 */
export const apiQueryDeveloperList = (
  params: FormValues,
): Promise<V1QueryDeveloperResponse> => get('/api/dev/developer', params);

/** 新增开发者 */
export const apiCreateDeveloper = (
  params: FormValues,
): Promise<V1CreateDeveloperResponse> => post('/api/dev/developer', params);

/** 修改开发者 */
export const apiUpdateDeveloper = (
  params: FormValues,
): Promise<V1UpdateDeveloperResponse> =>
  put(`/api/dev/developer/${params.id}`, omitObj(params, 'id'));
