import { FormValues, AyFormField, AnyKeyProps } from 'amiya';
import moment from 'moment';
import Storage from '@/utils/storage';

const cnLangMap: AnyKeyProps = {
  'zh-CN': '中文',
  'en-US': '英文',
  'ja-JP': '日文',
};
export const getLangLabel = (lang: string) => {
  return cnLangMap[lang];
};

export const getLocaleNameField = (
  title: string,
  key = 'i18n_name',
  props?: AnyKeyProps,
  field?: AnyKeyProps,
): AyFormField[] => {
  let merchant = Storage.get('merchant');
  let languageList: string[] = merchant.supported_language_list || [];

  return languageList.map((lang, index: number) => {
    return {
      title,
      key: '__name_group' + lang,
      type: 'group',
      required: props?.required === undefined ? true : props!.required,
      formItemProps: {
        className: index > 0 && 'no-label',
      },
      // 利于对齐
      children: [
        { title, key: key + '.' + lang, span: 18, type: 'input', required: true, ...props },
        {
          key: '__' + lang,
          span: 6,
          render: () => <span className="ay-form-text ay-form-tip">{getLangLabel(lang)}</span>,
        },
      ],
      ...field,
    };
  });
};

export const getLocaleNameRowField = (key = 'i18n_name', props?: AnyKeyProps): AyFormField[] => {
  let merchant = Storage.get('merchant');
  let languageList: string[] = merchant.supported_language_list || [];

  return languageList.map((lang) => {
    return { title: getLangLabel(lang), key: key + '.' + lang, type: 'input', ...props };
  });
};

/**
 * 获取对象的名称
 */
export const getLocaleName = (params: FormValues, key: string = 'i18n_name') => {
  if (!params) {
    return '';
  }
  let name = params[key];
  if (!name) {
    return '';
  }

  let merchant = Storage.get('merchant');
  let languageList: string[] = merchant.supported_language_list || [];

  return name[languageList[0] || 'zh-CN'];
};

/**
 * 设置多语言参数
 * @param params 当前行数据
 * @param key 需要设置多语言的 key
 */
export const setLocaleParams = (params: FormValues, key = 'i18n_name') => {
  let merchant = Storage.get('merchant');
  let languageList: string[] = merchant.supported_language_list || [];

  languageList.forEach((lang) => {
    params[`${key}.${lang}`] = params[key][lang];
  });
};

/**
 * 设置提交时多语言参数
 * @param params 当前行数据
 * @param key 需要设置多语言的 key
 */
export const setSubmitLocaleParams = (params: FormValues, key = 'i18n_name') => {
  params[key] = {
    'zh-CN': params[`${key}.zh-CN`],
    'en-US': params[`${key}.en-US`],
    'ja-JP': params[`${key}.ja-JP`],
  };
  delete params[`${key}.zh-CN`];
  delete params[`${key}.en-US`];
  delete params[`${key}.ja-JP`];
};

/**
 * 设置提交时时间参数
 * @param params 当前行数据
 * @param key 时间的 key
 * @param next: 是否为下一天
 */
export const setSubmitTimeParams = (params: FormValues, key: string, next = false) => {
  let seconds = Math.floor(
    moment.duration(params[key].valueOf() - moment(undefined).startOf('day').valueOf()).as('seconds'),
  );
  if (next) {
    seconds += 24 * 60 * 60;
  }
  return `${+seconds}`;
};

/**
 * 设置bool参数， 后台非bool值时
 * @param params 当前行数据
 * @param key  bool值的 key
 * @param options bool值的选项
 */
export const setBoolForParams = (params: FormValues, key: string, options: [any, any] = ['DISABLED', 'NORMAL']) => {
  const index = options.indexOf(params[key]);
  if (index === -1) {
    params[key] = false;
  } else {
    params[key] = !!index;
  }
};
