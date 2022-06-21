import { useConnection } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'

const API_DEVNET = 'https://api.devnet.solana.com'
const RPC_API_DEVNET = 'https://explorer-api.devnet.solana.com/'

const useRPC = () => {
    const { connection } = useConnection()

    // the endpoint provided by useConnection is wrong, so we need to use the RPC_API_DEVNET if we are on devnet.
    const rpcEndpoint = connection.rpcEndpoint === API_DEVNET ? new Connection(RPC_API_DEVNET) : connection

    return {
        rpcEndpoint,
    }
}

export default useRPC
