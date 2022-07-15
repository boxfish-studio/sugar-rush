import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useRPC } from 'hooks'
import { useWallet } from '@solana/wallet-adapter-react'

const MIN_TPS = 2500

const NetworkTps: FC = () => {
    const { rpcEndpoint } = useRPC()
    const [averageTps, setAverageTps] = useState(0)
    const { publicKey } = useWallet()

    const getNetworkPerformance = useCallback(async () => {
        if (!publicKey) return
        try {
            const samples = await rpcEndpoint.getRecentPerformanceSamples()
            const tpsList = samples.reduce((acc, sample) => {
                const tps = sample.numTransactions / sample.samplePeriodSecs
                return acc + tps
            }, 0)
            console.log('tpsList', tpsList)
            setAverageTps(tpsList / samples.length)
        } catch (err) {
            console.error(err)
        }
    }, [rpcEndpoint, publicKey])

    useEffect(() => {
        getNetworkPerformance()
    }, [getNetworkPerformance, publicKey, rpcEndpoint])

    const tps = useMemo(() => averageTps.toFixed() ?? 'N/A', [averageTps])
    const networkPerformanceText = useMemo(() => (averageTps > MIN_TPS ? '' : '⚠️'), [averageTps])
    if (averageTps === 0) return <></>
    return (
        <div className='d-flex gap-2'>
            <p>{networkPerformanceText}</p> <p>{tps}</p>
            <p>TPS</p>
        </div>
    )
}

export default NetworkTps
