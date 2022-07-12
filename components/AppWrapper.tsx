import { useWallet } from '@solana/wallet-adapter-react'
import CheckConnectedWallet from './CheckConnectedWallet'

function AppWrapper({ children }: { children: any }) {
    const { publicKey } = useWallet()

    if (publicKey) {
        return children
    }
    return <CheckConnectedWallet />
}

export default AppWrapper
