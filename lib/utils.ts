import { BN, web3 } from '@project-serum/anchor'
import { CANDY_MACHINE_PROGRAM_V2_ID, CIVIC, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID, TOKEN_PROGRAM_ID } from './constants';

/**
 *
 * @param dateTime date to parse
 * @param time time to parse
 * @returns {string} time parsed to UCT
 */
export function parseDateToUTC(dateTime: string, time: string): string {
    let UTCDate: string[] | string = new Date(dateTime).toDateString().slice(4).split(' ')
    const _temp = UTCDate[0]
    UTCDate[0] = UTCDate[1]
    UTCDate[1] = _temp
    UTCDate = UTCDate.join('.').replaceAll('.', ' ')

    const UTCTime = `${time}:00 GMT`

    return `${UTCDate} ${UTCTime}`
}

export function parseDateFromDateBN(date: BN) {
    let year = new Date(new BN(date).toNumber() * 1000).getFullYear().toString()
    let month = new Date(new BN(date).toNumber() * 1000).getMonth().toString()
    let day = new Date(new BN(date).toNumber() * 1000).getDate().toString()

    if (month.length === 1) {
        month = `0${month}`
    }

    if (day.length === 1) {
        day = `0${day}`
    }
    return `${year}-${month}-${day}`
}

export function parseTimeFromDateBN(date: BN) {
    let hours = new Date(new BN(date).toNumber() * 1000).getUTCHours().toString()
    let minutes = new Date(new BN(date).toNumber() * 1000).getMinutes().toString()

    if (hours.length === 1) {
        hours = `0${hours}`
    }

    if (minutes.length === 1) {
        minutes = `0${minutes}`
    }

    return `${hours}:${minutes}`
}

export function getCurrentTime() {
    let hours = new Date().getUTCHours().toString()
    let minutes = new Date().getMinutes().toString()

    if (hours.length === 1) {
        hours = `0${hours}`
    }

    if (minutes.length === 1) {
        minutes = `0${minutes}`
    }
    return `${hours}:${minutes}`
}

export function getCurrentDate() {
    const year = new Date().getFullYear().toString()
    let month = new Date().getMonth().toString()
    let day = new Date().getDate().toString()

    if (month.length === 1) {
        month = `0${month}`
    }

    if (day.length === 1) {
        day = `0${day}`
    }

    return `${year}-${month}-${day}`
}

export const getAtaForMint = async (
  mint: web3.PublicKey,
  buyer: web3.PublicKey,
): Promise<[web3.PublicKey, number]> => {
  return await web3.PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  );
};

export const getNetworkToken = async (
  wallet: web3.PublicKey,
  gatekeeperNetwork: web3.PublicKey,
): Promise<[web3.PublicKey, number]> => {
  return await web3.PublicKey.findProgramAddress(
    [
      wallet.toBuffer(),
      Buffer.from('gateway'),
      Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]),
      gatekeeperNetwork.toBuffer(),
    ],
    CIVIC,
  );
};


export const getNetworkExpire = async (
  gatekeeperNetwork: web3.PublicKey,
): Promise<[web3.PublicKey, number]> => {
  return await web3.PublicKey.findProgramAddress(
    [gatekeeperNetwork.toBuffer(), Buffer.from('expire')],
    CIVIC,
  );
};

export const getMetadata = async (
  mint: web3.PublicKey,
): Promise<web3.PublicKey> => {
  return (
    await web3.PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
};

export const getMasterEdition = async (
  mint: web3.PublicKey,
): Promise<web3.PublicKey> => {
  return (
    await web3.PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('edition'),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
};

export const getCandyMachineCreator = async (
  candyMachine: web3.PublicKey,
): Promise<[web3.PublicKey, number]> => {
  return await web3.PublicKey.findProgramAddress(
    [Buffer.from('candy_machine'), candyMachine.toBuffer()],
    CANDY_MACHINE_PROGRAM_V2_ID,
  );
};