import { AnyKeyProps, setDefaultDataFilter, setDefaultSearchFilter } from 'amiya';
import './form';
import './table';
import './index.less';
import 'amiya/lib/style/index.css';

/**
 * @desc 请求前接口数据处理。
 * @param params.pagination { pageSize: number, current: number } 分页数据
 * @param params.search object 查询数据
 * @param params.filter object 筛选的对象
 * @param params.sorts Array<{ key: string, order: 'ascend' | 'descend' }> 排序
 */
setDefaultSearchFilter((params: AnyKeyProps) => {
  let { current, pageSize } = params.pagination;
  let page = current - 1;
  return {
    // 这期分野先不做
    query_limit: current * pageSize,
    query_offset: page * pageSize,
    query_return_count: true,
    ...params.search,
    ...params.filters,
  };
});

/**
 * 表格请求后过滤
 * @param data object 接口请求完成的数据
 */
setDefaultDataFilter((res: AnyKeyProps) => {
  // return 的对象需要包含以下两条数据
  return {
    // 表格列表的数据
    content: res.list,
    // 数据总共 n 条
    totalCount: res.count,
    ...res,
  };
});
