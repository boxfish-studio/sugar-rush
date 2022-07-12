import { FC } from 'react'

const CheckConnectedWallet: FC = () => {
    return (
        <div
            className='d-flex flex-justify-center flex-items-center flex-col gap-4'
            style={{ height: '100vh', letterSpacing: '0.3px' }}
        >
            <h3>Please connect your Solana wallet</h3>
        </div>
    )
}

export default CheckConnectedWallet
