export const CODE_STATUS = {
  SUCCESS: 200, // 成功
  AUTHENTICATE: 401, // 未登录
  NO_AUTH: 403, // 无权限
  NO_REGISTER: 1153026, // 未注册
  INVALID_AUTH: 1153027, // 无效的身份信息
  NOT_LOGIN: 4000,
  SCM_SET_PWD_ERROR: 1153006, // 密码错误
  SCM_LOCK_PWD: 1153007, // 密码输错3次，账户锁定24小时
};

export const DEFULAT_MESSAGE = '请求出错';
