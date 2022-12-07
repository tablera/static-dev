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
  V1ExistProjectBySlugRequest,
  V1ExistProjectBySlugResponse,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Action<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags 项目
   * @name DevGatewayExistProjectBySlug
   * @summary 根据Slug查询项目是否存在
   * @request POST:/action/exist_project_by_slug
   */
  devGatewayExistProjectBySlug = (
    body: V1ExistProjectBySlugRequest,
    params: RequestParams = {},
  ) =>
    this.request<V1ExistProjectBySlugResponse, GooglerpcStatus>({
      path: `/action/exist_project_by_slug`,
      method: 'POST',
      body: body,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
}
