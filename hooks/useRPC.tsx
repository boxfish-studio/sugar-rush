import { useConnection } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import { useRecoilState } from 'recoil'
import { networkState } from 'lib/recoil-store/atoms'
import { useEffect, useState } from 'react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

// in the future this will come from the .env
// and this whole hook will be removed
// the reason we do this is because the public nodes cannot query getProgramAccounts since it is a heavy method
const API_DEVNET = 'https://api.devnet.solana.com'
const API_MAINNET = 'https://api.mainnet-beta.solana.com'
const RPC_API_DEVNET = 'https://explorer-api.devnet.solana.com/'
const RPC_API_MAINNET = 'https://api.mainnet-beta.solana.com'

const useRPC = () => {
    const { connection } = useConnection()
    const [network] = useRecoilState(networkState)

    const defaultConnection = { ...connection, rpcEndpoint: RPC_API_DEVNET } as Connection
    const [rpc, setRpc] = useState<Connection>(defaultConnection)

    useEffect(() => {
        window.localStorage.setItem('network-gg', network)
        if (network === WalletAdapterNetwork.Devnet) {
            setRpc(new Connection(RPC_API_DEVNET))
        } else if (network === WalletAdapterNetwork.Mainnet) {
            setRpc(new Connection(RPC_API_MAINNET))
        }
    }, [network])

    return {
        rpcEndpoint: rpc,
    }
}

export default useRPC
