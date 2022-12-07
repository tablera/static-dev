/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import {
  GooglerpcStatus,
  V1CreateDeveloperRequest,
  V1CreateDeveloperResponse,
  V1DeveloperStatusEnum,
  V1QueryDeveloperResponse,
  V1UpdateDeveloperResponse,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Developer<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags 开发者
   * @name DevGatewayQueryDeveloper
   * @summary 查询开发者
   * @request GET:/developer
   */
  devGatewayQueryDeveloper = (
    query?: {
      /** @format int32 */
      query_limit?: number;
      /** @format int32 */
      query_offset?: number;
      query_order_by_list?: string[];
      query_return_count?: boolean;
    },
    params: RequestParams = {},
  ) =>
    this.request<V1QueryDeveloperResponse, GooglerpcStatus>({
      path: `/developer`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags 开发者
   * @name DevGatewayCreateDeveloper
   * @summary 创建开发者
   * @request POST:/developer
   */
  devGatewayCreateDeveloper = (
    body: V1CreateDeveloperRequest,
    params: RequestParams = {},
  ) =>
    this.request<V1CreateDeveloperResponse, GooglerpcStatus>({
      path: `/developer`,
      method: 'POST',
      body: body,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags 开发者
   * @name DevGatewayUpdateDeveloper
   * @summary 更新开发者
   * @request PUT:/developer/{developer_id}
   */
  devGatewayUpdateDeveloper = (
    developerId: string,
    body: {
      /** 状态 */
      status?: V1DeveloperStatusEnum;
      /** 姓名 */
      name?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<V1UpdateDeveloperResponse, GooglerpcStatus>({
      path: `/developer/${developerId}`,
      method: 'PUT',
      body: body,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
}
