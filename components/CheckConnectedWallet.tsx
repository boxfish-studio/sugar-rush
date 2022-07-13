import { useWallet } from '@solana/wallet-adapter-react'

function CheckConnectedWallet({ children }: { children: JSX.Element }) {
    const { publicKey } = useWallet()

    if (!publicKey) {
        return (
            <div
                className='d-flex flex-justify-center flex-items-center flex-col gap-4'
                style={{ height: '100vh', letterSpacing: '0.3px' }}
            >
                <h3>Please connect your Solana wallet</h3>
            </div>
        )
    }
    return children
}

export default CheckConnectedWallet
