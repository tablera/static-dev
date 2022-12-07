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

export interface GooglerpcStatus {
  /** @format int32 */
  code?: number;
  message?: string;
  details?: ProtobufAny[];
}

export interface ProtobufAny {
  '@type'?: string;
  [key: string]: any;
}

export interface V1CreateDeveloperRequest {
  /** 状态 */
  status?: V1DeveloperStatusEnum;
  /** 类别 */
  type?: V1DeveloperTypeEnum;
  /** 姓名 */
  name?: string;
  /** 国家区号 */
  country_code?: string;
  /** 手机号码 */
  phone_number?: string;
}

export interface V1CreateDeveloperResponse {
  /** @format uint64 */
  id?: string;
}

export interface V1CreateProjectAssetFileResponse {
  /** @format uint64 */
  id?: string;
  /** 公开访问的 URL */
  public_url?: string;
}

export interface V1CreateProjectRequest {
  /** 状态 */
  status?: V1ProjectStatusEnum;
  /** slug - 项目唯一标识，只能包含字母、数字、短横线 */
  slug?: string;
  /** 名称 */
  name?: string;
}

export interface V1CreateProjectResponse {
  /** @format uint64 */
  id?: string;
}

export type V1DeleteProjectAssetFileResponse = object;

export interface V1Developer {
  /** @format uint64 */
  id?: string;
  /** @format date-time */
  create_time?: string;
  /** @format date-time */
  update_time?: string;
  status?: V1DeveloperStatusEnum;
  type?: V1DeveloperTypeEnum;
  name?: string;
  /** @format uint64 */
  user_id?: string;
  country_code?: string;
  phone_number?: string;
}

/**
 * - UNKNOWN: 占位
 *  - NORMAL: 正常
 *  - DISABLED: 禁用
 * @default "UNKNOWN"
 */
export enum V1DeveloperStatusEnum {
  UNKNOWN = 'UNKNOWN',
  NORMAL = 'NORMAL',
  DISABLED = 'DISABLED',
}

/**
 * - UNKNOWN: 占位
 *  - HUMAN: 人类
 *  - BOT: 机器人
 * @default "UNKNOWN"
 */
export enum V1DeveloperTypeEnum {
  UNKNOWN = 'UNKNOWN',
  HUMAN = 'HUMAN',
  BOT = 'BOT',
}

export interface V1ExistProjectBySlugRequest {
  slug?: string;
}

export interface V1ExistProjectBySlugResponse {
  existed?: boolean;
}

export interface V1GetProjectByIdResponse {
  item?: V1Project;
}

export interface V1Project {
  /** @format uint64 */
  id?: string;
  /** @format date-time */
  create_time?: string;
  /** @format date-time */
  update_time?: string;
  status?: V1ProjectStatusEnum;
  slug?: string;
  name?: string;
}

export interface V1ProjectAssetFile {
  /** @format uint64 */
  id?: string;
  /** @format date-time */
  create_time?: string;
  /** @format date-time */
  update_time?: string;
  type?: V1ProjectAssetFileTypeEnum;
  /** @format uint64 */
  project_id?: string;
  /** @format uint64 */
  parent_id?: string;
  parent_id_list?: string[];
  /** @format uint64 */
  developer_id?: string;
  name?: string;
  /** @format uint64 */
  version?: string;
  object_key?: string;
  public_url?: string;
  /** @format int64 */
  size?: string;
  content_type?: string;
}

/**
 * - UNKNOWN: 占位
 *  - FILE: 文件
 *  - DIRECTORY: 目录
 * @default "UNKNOWN"
 */
export enum V1ProjectAssetFileTypeEnum {
  UNKNOWN = 'UNKNOWN',
  FILE = 'FILE',
  DIRECTORY = 'DIRECTORY',
}

export interface V1ProjectAssetFileVersion {
  /** @format uint64 */
  id?: string;
  /** @format date-time */
  create_time?: string;
  /** @format date-time */
  update_time?: string;
  /** @format uint64 */
  project_id?: string;
  /** @format uint64 */
  asset_id?: string;
  /** @format uint64 */
  developer_id?: string;
  /** @format uint64 */
  version?: string;
  object_key?: string;
  public_url?: string;
  /** @format int64 */
  size?: string;
  content_type?: string;
}

/**
 * - UNKNOWN: 占位
 *  - NORMAL: 正常
 *  - DISABLED: 禁用
 * @default "UNKNOWN"
 */
export enum V1ProjectStatusEnum {
  UNKNOWN = 'UNKNOWN',
  NORMAL = 'NORMAL',
  DISABLED = 'DISABLED',
}

export interface V1QueryDeveloperResponse {
  list?: V1Developer[];
  /** @format int32 */
  count?: number;
}

export interface V1QueryProjectAssetFileResponse {
  list?: V1ProjectAssetFile[];
  /** @format int32 */
  count?: number;
}

export interface V1QueryProjectAssetFileVersionResponse {
  list?: V1ProjectAssetFileVersion[];
  /** @format int32 */
  count?: number;
}

export interface V1QueryProjectResponse {
  list?: V1Project[];
  /** @format int32 */
  count?: number;
}

export interface V1RenameProjectAssetFileResponse {
  public_url?: string;
}

export interface V1ReplaceProjectAssetFileResponse {
  /** 公开访问的 URL */
  public_url?: string;
}

export type V1UpdateDeveloperResponse = object;

export type V1UpdateProjectResponse = object;
