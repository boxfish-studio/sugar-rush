import { BN } from '@project-serum/anchor';

/**
 *
 * @param dateTime date to parse
 * @param time time to parse
 * @returns {string} time parsed to UCT
 */
export function parseDateToUTC(dateTime: string, time: string): string {
  let UTCDate: string[] | string = new Date(dateTime)
    .toDateString()
    .slice(4)
    .split(' ');
  const _temp = UTCDate[0];
  UTCDate[0] = UTCDate[1];
  UTCDate[1] = _temp;
  UTCDate = UTCDate.join('.').replaceAll('.', ' ');

  const UTCTime = `${time}:00 GMT`;

  return `${UTCDate} ${UTCTime}`;
}

export function parseDateFromDateBN(date: BN) {
  let year = new Date(new BN(date).toNumber() * 1000).getFullYear();
  let month = new Date(new BN(date).toNumber() * 1000).getMonth().toString();
  let day = new Date(new BN(date).toNumber() * 1000).getDate().toString();

  if (month.length === 1) {
    month = `0${month}`;
  }

  if (day.length === 1) {
    day = `0${day}`;
  }
  return `${year}-${month}-${day}`;
}

export function parseTimeFromDateBN(date: BN) {
  let hours = new Date(new BN(date).toNumber() * 1000).getUTCHours().toString();

  if (hours.length === 1) {
    hours = `0${hours}`;
  }

  let minutes = new Date(new BN(date).toNumber() * 1000)
    .getMinutes()
    .toString();

  if (minutes.length === 1) {
    minutes = `0${minutes}`;
  }

  return `${hours}:${minutes}`;
}
