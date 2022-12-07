import axios from 'axios';
import { CODE_STATUS, DEFULAT_MESSAGE } from './constant';
import { notification } from 'antd';
import { history } from 'umi';
import { AnyKeyProps, error, Record } from 'amiya';

const instance = axios.create({
  timeout: 10 * 1000, // 设置超时时间10s
  withCredentials: true, // 通过cookie校验身份（必传）
});

// @ts-ignore
let apiBase = 'https://api.dev.tablera.cn';

console.log('请求路径：', apiBase);

/** 添加请求拦截器 **/
instance.interceptors.request.use(
  (config) => {
    if (config.method === 'post') {
      config.headers['Content-Type'] = 'application/json';
    }
    let token = localStorage.getItem('token');
    if (token) {
      config.headers.common['Authorization'] = 'Bearer ' + token;
    }
    try {
      config.url = config.url?.replace('/api', apiBase);
    } catch {}
    return config;
  },
  (error) => {
    console.error('请求拦截-错误', error);
  },
);

/** 添加响应拦截器  **/
instance.interceptors.response.use(
  (response) => {
    let contentType = response.headers['content-type'];
    // 文件流直接返回
    if (
      contentType.includes('application/vnd.ms-excel') ||
      contentType.includes('text/csv')
    ) {
      return Promise.resolve(response);
    }
    const { data, status } = response;
    switch (status) {
      case CODE_STATUS.SUCCESS:
        return Promise.resolve(data);
      default:
        error(DEFULAT_MESSAGE);
        return Promise.reject(DEFULAT_MESSAGE);
    }
  },
  (error) => {
    if (!error) {
      return Promise.reject();
    }
    let { response } = error;
    if (response) {
      if (response.data.code === CODE_STATUS.AUTHENTICATE) {
        if (response.data.message === 'JWT token is missing') {
          notification.error({
            message: '未登录',
            description: '账号未登录，请前往登录页面进行登录',
          });
          return Promise.reject('尚未登录');
        } else {
          notification.error({
            message: '无权限',
            description: '账号无权限，请重新选择入口',
          });
          return Promise.reject('无权限');
        }
      }
      if (response.data.code === CODE_STATUS.NO_AUTH) {
        notification.error({
          message: '无权限',
          description: '账号无权限，请重新选择入口',
        });
        // toEntrance();
        return Promise.reject('无权限');
      }

      notification.error({
        message: `服务器错误-${error.response.status}`,
        description: error.response.data.message,
      });
      return Promise.reject('服务器错误');
    } else {
      notification.error({
        message: '网络连接失败',
        description: '请刷新重试',
      });
      return Promise.reject('网络连接失败');
    }
  },
);

/* 统一封装get请求 */
export const get = (url: string, data?: any, config = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    instance({
      method: 'get',
      url: url,
      params: data,
      ...config,
    })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/* 统一封装post请求  */
export const post = (url: string, data?: any, config = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    instance({
      method: 'post',
      url: url,
      data,
      ...config,
    })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/* 统一封装put请求  */
export const put = (url: string, data?: any, config = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    instance({
      method: 'put',
      url: url,
      data,
      ...config,
    })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/* 统一封装delete请求  */
export const remove = (url: string, data?: any, config = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    instance({
      method: 'delete',
      url: url,
      data,
      ...config,
    })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// 提交携带上传文件
export const postWithFile = (
  url: string,
  data?: any,
  config = {},
): Promise<any> => {
  let formData = new FormData();
  for (let key in data) {
    formData.append(key, data[key]);
  }
  return new Promise((resolve, reject) => {
    instance({
      method: 'post',
      url: url,
      data: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      ...config,
    })
      .then((response) => {
        resolve(response);
      })
      .catch(({ error }) => {
        reject(error);
      });
  });
};

/**
 * 从提交参数里面获取 id
 * @param params 提交参数
 * @param key 需要获取的 key，默认 id
 * @returns id
 */
export const getId = (params: AnyKeyProps, key: string = 'id') => {
  return params[key];
};

/**
 * 删除提交参数里的 id
 * @param params 提交参数
 * @param key 需要删除 key，默认 id
 * @returns 新的提交参数
 */
export const deleteId = (params: AnyKeyProps, key: string = 'id') => {
  let newParams = {
    ...params,
  };
  delete newParams[key];
  return newParams;
};
