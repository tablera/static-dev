import moment from 'moment';

/**
 * 通过后台时间字符串判断是否跨天
 * @param time 后台时间字符串 seconds
 */
export const isNextDayForModel = (time: string) => {
  return +time >= 24 * 60 * 60;
};

/**
 * 后台时间字符串转界面显示时间字符串
 * format: seconds => hh:mm
 */
export const showLabelForModel = (time: string) => {
  if (isNextDayForModel(time)) {
    time = `${+time - 24 * 60 * 60}`;
  }
  const timeMoment = moment.duration(time, 'seconds');
  const hour = timeMoment.hours();
  const minute = timeMoment.minutes();
  return moment({ h: hour, m: minute }).format('HH:mm');
};

/**
 * 转换秒为时分天
 * 精度待优化
 * @param seconds 秒数: number
 * @param unit  转换为哪个单位: 'h' | 'm' | 'd'
 */
export const formatSeconds = (seconds: number, unit: 'm' | 'h' | 'd') => {
  // 秒转换成分钟 或 小时,并保留有效小数
  const timeMoment = moment.duration(seconds * 1000);
  let duration = 0;
  switch (unit) {
    case 'm':
      duration = timeMoment.as('minutes');
      break;
    case 'h':
      duration = timeMoment.as('hours');
      break;
    default:
      duration = timeMoment.as('seconds');
      break;
  }
  // 如果小数点后超过两位，则取两位
  return duration.toString().split('.')[1]?.length > 2 ? +duration.toFixed(2) : duration;
};

/**
 * 转换秒为moment, 处理跨天情况。
 * @param time 时间字符串 seconds
 */
export const formatMomentForModel = (time: string) => {
  let timeNum = +time;
  let isNextDay = false;
  if (isNextDayForModel(time)) {
    timeNum = timeNum - 24 * 60 * 60;

    isNextDay = true;
  }

  const secondsMoment = moment.duration(timeNum, 'seconds');
  const hour = secondsMoment.hours();
  const minute = secondsMoment.minutes();
  const timeMoment = moment({ h: hour, m: minute });
  return {
    moment: timeMoment,
    bool: isNextDay,
  };
};
