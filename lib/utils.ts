import { BN } from '@project-serum/anchor'
import { CANDY_MACHINE_PROGRAM_V2_ID } from 'lib/candy-machine/mint/constants'
import { Connection, PublicKey } from '@solana/web3.js'

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

export function shardArray(array: string[], size: number) {
    return Array.apply(0, new Array(Math.ceil(array.length / size))).map((_, index) =>
        array.slice(index * size, (index + 1) * size)
    )
}

export function getTextFromUTF8Array(data: number[]) {
    // array of bytes
    let str: string = ''

    for (let i = 0; i < data.length; i++) {
        const value: number = data[i]

        if (value < 0x80) {
            str += String.fromCharCode(value)
        } else if (value > 0xbf && value < 0xe0) {
            str += String.fromCharCode(((value & 0x1f) << 6) | (data[i + 1] & 0x3f))
            i += 1
        } else if (value > 0xdf && value < 0xf0) {
            str += String.fromCharCode(((value & 0x0f) << 12) | ((data[i + 1] & 0x3f) << 6) | (data[i + 2] & 0x3f))
            i += 2
        } else {
            // surrogate pair
            const charCode: number =
                (((value & 0x07) << 18) |
                    ((data[i + 1] & 0x3f) << 12) |
                    ((data[i + 2] & 0x3f) << 6) |
                    (data[i + 3] & 0x3f)) -
                0x010000

            str += String.fromCharCode((charCode >> 10) | 0xd800, (charCode & 0x03ff) | 0xdc00)
            i += 3
        }
    }

    return str
}

export const fetchCandyMachineAccounts = async (rpcEndpoint: Connection, publicKey: PublicKey): Promise<string[]> => {
    try {
        const accounts =
            (await rpcEndpoint.getProgramAccounts(CANDY_MACHINE_PROGRAM_V2_ID, {
                commitment: 'confirmed',
                filters: [
                    {
                        memcmp: {
                            offset: 8,
                            bytes: publicKey!.toBase58(),
                        },
                    },
                ],
            })) ?? []

        const accountsPubkeys = accounts.map((account) => account.pubkey.toBase58()).sort()

        return accountsPubkeys
    } catch (err) {
        console.error(err)
        return []
    }
}
