import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from 'components/WalletWrapper'
import { FC } from 'react'

const Wallet: FC = () => {
    const { publicKey } = useWallet()

    return (
        <div className='position-fixed right-0 scale-75 flex flex-row gap-3 z-10'>
            <WalletMultiButton className='solana-wallet-adapter-button'>
                {!publicKey
                    ? 'Connect Wallet'
                    : publicKey?.toBase58().slice(0, 4) + '..' + publicKey?.toBase58().slice(-4)}{' '}
            </WalletMultiButton>
        </div>
    )
}

export default Wallet
