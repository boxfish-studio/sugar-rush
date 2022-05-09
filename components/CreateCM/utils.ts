import { BN } from '@project-serum/anchor';

/**
 *
 * @param dateTime date to parse
 * @param time time to parse
 * @returns {string} time parsed to UCT
 */
export function UTCify(dateTime: string, time: string): string {
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
  return `${new Date(new BN(date).toNumber() * 1000).getFullYear()}-${
    new Date(new BN(date).toNumber() * 1000).getMonth().toString().length == 1
      ? '0'.concat(
          new Date(new BN(date).toNumber() * 1000).getMonth().toString()
        )
      : new Date(new BN(date).toNumber() * 1000).getMonth().toString()
  }-${
    new Date(new BN(date).toNumber() * 1000).getDate().toString().length == 1
      ? '0'.concat(
          new Date(new BN(date).toNumber() * 1000).getDate().toString()
        )
      : new Date(new BN(date).toNumber() * 1000).getDate().toString()
  }`;
}

export function parseTimeFromDateBN(date: BN) {
  return `${
    new Date(new BN(date).toNumber() * 1000).getUTCHours().toString().length ==
    1
      ? '0'.concat(
          new Date(new BN(date).toNumber() * 1000).getUTCHours().toString()
        )
      : new Date(new BN(date).toNumber() * 1000).getUTCHours().toString()
  }:${
    new Date(new BN(date).toNumber() * 1000).getMinutes().toString().length == 1
      ? '0'.concat(
          new Date(new BN(date).toNumber() * 1000).getMinutes().toString()
        )
      : new Date(new BN(date).toNumber() * 1000).getMinutes().toString()
  }`;
}
