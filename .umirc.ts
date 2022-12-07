import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: true,
  },
  base: '/dev',
  publicPath: '/dev/',
  routes: [
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        { path: '/home', component: '@/pages/home/index' },
        { path: '/project/:id', component: '@/pages/project/index' },
        { path: '/welcome', component: '@/pages/welcome/index' },
        { path: '/assets', component: '@/pages/assets/index' },
        { path: '/developer', component: '@/pages/developer/index' },
      ],
    },
  ],
  fastRefresh: {},
  dynamicImport: {},
});
