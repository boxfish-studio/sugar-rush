import { useWallet } from '@solana/wallet-adapter-react'
import CheckConnectedWallet from './CheckConnectedWallet'

function AppWrapper({ children }: { children: JSX.Element }) {
    const { publicKey } = useWallet()

    if (!publicKey) {
        return <CheckConnectedWallet />
    }
    return children
}

export default AppWrapper
