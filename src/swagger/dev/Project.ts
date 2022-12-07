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
  V1CreateProjectAssetFileResponse,
  V1CreateProjectRequest,
  V1CreateProjectResponse,
  V1DeleteProjectAssetFileResponse,
  V1GetProjectByIdResponse,
  V1ProjectAssetFileTypeEnum,
  V1ProjectStatusEnum,
  V1QueryProjectAssetFileResponse,
  V1QueryProjectAssetFileVersionResponse,
  V1QueryProjectResponse,
  V1RenameProjectAssetFileResponse,
  V1ReplaceProjectAssetFileResponse,
  V1UpdateProjectResponse,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class Project<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags 项目
   * @name DevGatewayQueryProject
   * @summary 查询项目
   * @request GET:/project
   */
  devGatewayQueryProject = (
    query?: {
      /** @format int32 */
      query_limit?: number;
      /** @format int32 */
      query_offset?: number;
      query_order_by_list?: string[];
      query_return_count?: boolean;
      /**
       * 状态
       *
       *  - UNKNOWN: 占位
       *  - NORMAL: 正常
       *  - DISABLED: 禁用
       * @default "UNKNOWN"
       */
      status?: 'UNKNOWN' | 'NORMAL' | 'DISABLED';
    },
    params: RequestParams = {},
  ) =>
    this.request<V1QueryProjectResponse, GooglerpcStatus>({
      path: `/project`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags 项目
   * @name DevGatewayCreateProject
   * @summary 创建项目
   * @request POST:/project
   */
  devGatewayCreateProject = (
    body: V1CreateProjectRequest,
    params: RequestParams = {},
  ) =>
    this.request<V1CreateProjectResponse, GooglerpcStatus>({
      path: `/project`,
      method: 'POST',
      body: body,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags 项目
   * @name DevGatewayGetProjectById
   * @summary 根据ID查询项目
   * @request GET:/project/{project_id}
   */
  devGatewayGetProjectById = (projectId: string, params: RequestParams = {}) =>
    this.request<V1GetProjectByIdResponse, GooglerpcStatus>({
      path: `/project/${projectId}`,
      method: 'GET',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags 项目
   * @name DevGatewayUpdateProject
   * @summary 更新项目
   * @request PUT:/project/{project_id}
   */
  devGatewayUpdateProject = (
    projectId: string,
    body: {
      /** 状态 */
      status?: V1ProjectStatusEnum;
      /** 名称 */
      name?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<V1UpdateProjectResponse, GooglerpcStatus>({
      path: `/project/${projectId}`,
      method: 'PUT',
      body: body,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags 资源文件
   * @name DevGatewayQueryProjectAssetFile
   * @summary 查询项目资源文件
   * @request GET:/project/{project_id}/aseet_file
   */
  devGatewayQueryProjectAssetFile = (
    projectId: string,
    query?: {
      /** @format int32 */
      query_limit?: number;
      /** @format int32 */
      query_offset?: number;
      query_order_by_list?: string[];
      query_return_count?: boolean;
      /**
       * 父级目录 ID
       * @format uint64
       */
      parent_id?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<V1QueryProjectAssetFileResponse, GooglerpcStatus>({
      path: `/project/${projectId}/aseet_file`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags 资源文件
   * @name DevGatewayCreateProjectAssetFile
   * @summary 创建项目资源文件
   * @request POST:/project/{project_id}/aseet_file
   */
  devGatewayCreateProjectAssetFile = (
    projectId: string,
    body: {
      /** 类型 */
      type?: V1ProjectAssetFileTypeEnum;
      /**
       * 父级目录 ID
       * @format uint64
       */
      parent_id?: string;
      /** 名称 */
      name?: string;
      /** 对象存储的 Key */
      object_key?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<V1CreateProjectAssetFileResponse, GooglerpcStatus>({
      path: `/project/${projectId}/aseet_file`,
      method: 'POST',
      body: body,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags 资源文件
   * @name DevGatewayDeleteProjectAssetFile
   * @summary 删除项目资源文件
   * @request DELETE:/project/{project_id}/aseet_file/{file_id}
   */
  devGatewayDeleteProjectAssetFile = (
    projectId: string,
    fileId: string,
    params: RequestParams = {},
  ) =>
    this.request<V1DeleteProjectAssetFileResponse, GooglerpcStatus>({
      path: `/project/${projectId}/aseet_file/${fileId}`,
      method: 'DELETE',
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags 资源文件
   * @name DevGatewayRenameProjectAssetFile
   * @summary 重命名项目资源文件
   * @request POST:/project/{project_id}/aseet_file/{file_id}/action/rename
   */
  devGatewayRenameProjectAssetFile = (
    projectId: string,
    fileId: string,
    body: {
      /** 名称 */
      name?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<V1RenameProjectAssetFileResponse, GooglerpcStatus>({
      path: `/project/${projectId}/aseet_file/${fileId}/action/rename`,
      method: 'POST',
      body: body,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags 资源文件
   * @name DevGatewayReplaceProjectAssetFile
   * @summary 替换项目资源文件
   * @request POST:/project/{project_id}/aseet_file/{file_id}/action/replace
   */
  devGatewayReplaceProjectAssetFile = (
    projectId: string,
    fileId: string,
    body: {
      /** 对象存储的 Key */
      object_key?: string;
    },
    params: RequestParams = {},
  ) =>
    this.request<V1ReplaceProjectAssetFileResponse, GooglerpcStatus>({
      path: `/project/${projectId}/aseet_file/${fileId}/action/replace`,
      method: 'POST',
      body: body,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags 资源文件
   * @name DevGatewayQueryProjectAssetFileVersion
   * @summary 查询项目资源文件版本
   * @request GET:/project/{project_id}/aseet_file/{file_id}/version
   */
  devGatewayQueryProjectAssetFileVersion = (
    projectId: string,
    fileId: string,
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
    this.request<V1QueryProjectAssetFileVersionResponse, GooglerpcStatus>({
      path: `/project/${projectId}/aseet_file/${fileId}/version`,
      method: 'GET',
      query: query,
      format: 'json',
      ...params,
    });
}
