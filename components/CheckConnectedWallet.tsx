import { useWallet } from '@solana/wallet-adapter-react'
import { candyMachinesState } from 'lib/recoil-store/atoms'
import { FC, useEffect } from 'react'
import { useResetRecoilState } from 'recoil'

const CheckConnectedWallet: FC<{ children: JSX.Element }> = ({ children }) => {
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
