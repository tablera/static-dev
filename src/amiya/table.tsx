import { registerTableRender, setTableDefaultProps } from 'amiya';
import { Switch, Typography, Image } from 'antd';
import AnyKeyProps from '@/types/AnyKeyProps';
import { formatDatetime, renderStatus } from '@/utils';
import Storage from '@/utils/storage';
import { getLangLabel } from './fields';
const { Paragraph } = Typography;

setTableDefaultProps({
  bordered: false,
});

/**
 * 1
 * @decs 复制列
 *
 * @returns ReactNode
 */
registerTableRender('copy', ({ text }: AnyKeyProps) => {
  return (
    <Paragraph copyable style={{ marginBottom: 0 }}>
      {text}
    </Paragraph>
  );
});

/**
 * 2
 * @decs 时间显示格式化
 *
 * @params time
 *
 * @returns format time
 */
registerTableRender('datetime', ({ text }: AnyKeyProps) => formatDatetime(text));

/**
 * 3
 * @decs 状态加文字
 *
 * @returns ReactNode
 */
registerTableRender('status-text', ({ text, field }: AnyKeyProps) => {
  const { options = [] } = field;
  return renderStatus(text, options);
});

/**
 * 3
 * @decs 金额
 *
 * @returns ReactNode
 */
registerTableRender('price', ({ text, field }: AnyKeyProps) => {
  if (!text) return '';
  // 保留两位
  return '¥' + (+text / 100).toFixed(2);
});

/**
 * 4
 * @decs 状态
 *
 * @returns ReactNode
 */
registerTableRender('status-switch', ({ text, field }: AnyKeyProps) => {
  return <Switch checked={text === 'NORMAL'} disabled {...field.props} />;
});

/**
 * 5
 * @decs 多语言名称
 *
 * @returns ReactNode
 */
registerTableRender('i18n', ({ text, field }: AnyKeyProps) => {
  if (!text) {
    return '';
  }

  let merchant = Storage.get('merchant');
  let languageList: string[] = merchant.supported_language_list || [];

  return (
    <div>
      {languageList.map((lang) => (
        <div key={lang}>
          {getLangLabel(lang)}: {text[lang] || '-'}
        </div>
      ))}
    </div>
  );
});

/**
 * 7
 * @decs 图片
 *
 * @returns ReactNode
 */
registerTableRender('image', ({ text }: AnyKeyProps) => {
  if (!text) {
    return null;
  }
  return (
    <Image
      src={text + window.config.IMAGE_THUMBNAIL}
      width={70}
      height={70}
      preview={{
        src: text + window.config.IMAGE_ORIGIN,
      }}
    />
  );
});
