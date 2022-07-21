import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useRPC } from 'hooks'

const MIN_TPS = 2500

const NetworkTps: FC = () => {
    const { connection } = useRPC()
    const [averageTps, setAverageTps] = useState(0)

    const getNetworkPerformance = useCallback(async () => {
        try {
            const samples = await connection.getRecentPerformanceSamples()
            const tpsList = samples.reduce((acc, sample) => {
                const tps = sample.numTransactions / sample.samplePeriodSecs
                return acc + tps
            }, 0)
            setAverageTps(tpsList / samples.length)
        } catch (err) {
            console.error(err)
        }
    }, [connection])

    useEffect(() => {
        getNetworkPerformance()
    }, [getNetworkPerformance, connection])

    const tps = useMemo(() => averageTps.toFixed() ?? 'N/A', [averageTps])
    const networkPerformanceText = useMemo(() => (averageTps > MIN_TPS ? '' : '⚠️'), [averageTps])
    if (averageTps === 0) return <></>
    return (
        <div className='d-flex gap-2 flex-justify-center flex-items-center flex-content-center pr-4 f4 cursor-default'>
            <p className='m-0'>{networkPerformanceText}</p> <p className='m-0 pl-2'>{tps}</p>
            <p className='m-0 pl-2'>TPS</p>
        </div>
    )
}

export default NetworkTps
