import { defineConfig } from 'umi';

export default defineConfig({
  define: {
    ENV: 'prod',
  },
  hash: true,
  ignoreMomentLocale: true,
});
