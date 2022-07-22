import { useRecoilState } from 'recoil'
import { networkState } from 'lib/recoil-store/atoms'
import { Connection } from '@solana/web3.js'
import { useEffect, useState } from 'react'

// const RPC_API_MAINNET = process.env.NEXT_PUBLIC_RPC_API_MAINNET as string

const useRPC = () => {
    const [network] = useRecoilState(networkState)
    const [rpc, setRpc] = useState<Connection>()

    useEffect(() => {
        if (network?.connection) {
            setRpc(network.connection)
        }
    }, [network])

    return {
        connection: rpc,
        isDevnet: network?.url.includes('devnet') ? '?cluster=devnet' : '',
    }
}

export default useRPC
