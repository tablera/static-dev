window.config = {};

switch (window.location.hostname) {
  // 本地
  case '192.168.2.19':
    window.config.API_BASE = 'https://api.dev.tablera.cn';
    // 登录地址
    window.config.LOGIN_PATH = 'https://fe.dev.tablera.cn/passport/login/';
    // 入口选择地址
    window.config.ENTRANCE_PATH = 'https://fe.dev.tablera.cn/passport/entrance/';
    window.config.DEFULAT_PATH = 'https://fe.dev.tablera.cn';
    // 预览图
    window.config.IMAGE_THUMBNAIL = '/thumbnail-256x256.webp';
    // 原图
    window.config.IMAGE_ORIGIN = '/original.webp';
    break;
  case 'localhost':
    switch (window.location.port) {
      case '2020':
        window.config.API_BASE = 'http://localhost:2020/api';
        window.config.LOGIN_PATH = 'http://localhost:2020/passport/login/';
        window.config.ENTRANCE_PATH = 'http://localhost:2020/passport/entrance/';
        window.config.DEFULAT_PATH = 'http://localhost:2020';
        window.config.IMAGE_THUMBNAIL = '';
        window.config.IMAGE_ORIGIN = '';
        break;
      default:
        window.config.API_BASE = 'https://api.dev.tablera.cn';
        // 登录地址
        window.config.LOGIN_PATH = 'https://fe.dev.tablera.cn/passport/login/';
        // 入口选择地址
        window.config.ENTRANCE_PATH = 'https://fe.dev.tablera.cn/passport/entrance/';
        window.config.DEFULAT_PATH = 'https://fe.dev.tablera.cn';
        // 预览图
        window.config.IMAGE_THUMBNAIL = '/thumbnail-256x256.webp';
        // 原图
        window.config.IMAGE_ORIGIN = '/original.webp';
    }

    break;
  // 测试
  case 'fe.dev.tablera.cn':
    window.config.API_BASE = 'https://api.dev.tablera.cn';
    window.config.LOGIN_PATH = '/passport/login/';
    window.config.ENTRANCE_PATH = '/passport/entrance/';
    window.config.DEFULAT_PATH = 'https://fe.dev.tablera.cn';
    window.config.IMAGE_THUMBNAIL = '/thumbnail-256x256.webp';
    window.config.IMAGE_ORIGIN = '/original.webp';
    break;
  // 正式
  case 'fe.tablera.com':
    window.config.API_BASE = 'https://api.tablera.com';
    window.config.LOGIN_PATH = '/passport/login/';
    window.config.ENTRANCE_PATH = '/passport/entrance/';
    window.config.DEFULAT_PATH = 'https://fe.tablera.com';
    window.config.IMAGE_THUMBNAIL = '/thumbnail-256x256.webp';
    window.config.IMAGE_ORIGIN = '/original.webp';
    break;
  // lv
  case 'louis-vuitton.static.tablera.cn':
    window.config.API_BASE = 'https://louis-vuitton.api.tablera.cn';
    window.config.LOGIN_PATH = '/passport/login/';
    window.config.ENTRANCE_PATH = '/passport/entrance/';
    window.config.DEFULAT_PATH = 'https://louis-vuitton.static.tablera.cn';
    window.config.IMAGE_THUMBNAIL = '';
    window.config.IMAGE_ORIGIN = '';
    break;
  // lv 正式
  case 'cdcafe.lvcampaign.com':
    window.config.API_BASE = 'https://cdcafe.lvcampaign.com/api';
    window.config.LOGIN_PATH = '/passport/login/';
    window.config.ENTRANCE_PATH = '/passport/entrance/';
    window.config.DEFULAT_PATH = 'https://cdcafe.lvcampaign.com';
    window.config.IMAGE_THUMBNAIL = '';
    window.config.IMAGE_ORIGIN = '';
    break;
  // lv 测试
  case 'cdcafetest.lvcampaign.com':
    window.config.API_BASE = 'https://cdcafetest.lvcampaign.com/api';
    window.config.LOGIN_PATH = '/passport/login/';
    window.config.ENTRANCE_PATH = '/passport/entrance/';
    window.config.DEFULAT_PATH = 'https://cdcafetest.lvcampaign.com';
    window.config.IMAGE_THUMBNAIL = '';
    window.config.IMAGE_ORIGIN = '';
    break;
}
