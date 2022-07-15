import { useWallet } from '@solana/wallet-adapter-react'
import { candyMachinesState } from 'lib/recoil-store/atoms'
import { useEffect } from 'react'
import { useResetRecoilState } from 'recoil'

function CheckConnectedWallet({ children }: { children: JSX.Element }) {
    const { publicKey } = useWallet()

    const resetCandyMachines = useResetRecoilState(candyMachinesState)

    useEffect(() => {
        resetCandyMachines()
    }, [publicKey])

    if (!publicKey) {
        return (
            <div
                className='d-flex flex-justify-center flex-items-center flex-column'
                style={{ height: '100vh', letterSpacing: '0.3px' }}
            >
                <h3>Please connect your Solana wallet</h3>
            </div>
        )
    }
    return children
}

export default CheckConnectedWallet
