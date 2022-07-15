import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { FC } from 'react'

const Wallet: FC = () => {
    return (
        <div className='position-fixed right-0 scale-75 flex flex-row gap-3 z-10'>
            <WalletMultiButton />
        </div>
    )
}

export default Wallet
