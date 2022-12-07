import { formatMessage, useIntl } from 'umi';

const t = (id: string) => formatMessage({ id });

export function useT() {
  const intf = useIntl();

  const t = (id: string) => intf.formatMessage({ id });
  return t;
}

export default t;
