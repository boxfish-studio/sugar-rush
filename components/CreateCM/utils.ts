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
