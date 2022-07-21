import { Connection } from '@solana/web3.js'
import { useRecoilState } from 'recoil'
import { networkState } from 'lib/recoil-store/atoms'
import { useEffect, useState } from 'react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

const RPC_API_DEVNET = process.env.NEXT_PUBLIC_RPC_API_DEVNET as string
const RPC_API_MAINNET = process.env.NEXT_PUBLIC_RPC_API_MAINNET as string

const useRPC = () => {
    console.log(RPC_API_DEVNET, RPC_API_MAINNET)
    const [network] = useRecoilState(networkState)
    const connection = new Connection(RPC_API_MAINNET, 'finalized')
    const [rpc, setRpc] = useState<Connection>(connection)

    useEffect(() => {
        network && window.localStorage.setItem('network-gg', network)
        if (network === WalletAdapterNetwork.Devnet) {
            setRpc(new Connection(RPC_API_DEVNET))
        } else if (network === WalletAdapterNetwork.Mainnet) {
            setRpc(new Connection(RPC_API_MAINNET))
        }
    }, [network])

    return {
        connection: rpc,
    }
}

export default useRPC
