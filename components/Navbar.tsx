import { FC } from 'react'
import Image from 'next/image'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { NetworkSelector, NetworkTps, Breadcrumb } from 'components'

const Navbar: FC = () => {
    return (
        <nav
            className='color-bg-emphasis color-fg-subtle position-fixed top-0 left-0 z-3 width-full d-flex flex-row color-fg-on-emphasis'
            style={{ height: '70px' }}
        >
            <div className='d-flex width-full container-xl p-responsive py-4 flex-justify-between flex-items-center'>
                <div className='d-flex flex-items-center flex-justify-start width-full'>
                    <div className='d-flex flex-shrink-0'>
                        <Image src='/logo.png' alt='logo' width={29} height={21} />
                        <h4 className='ml-2'>Sugar Rush</h4>
                    </div>
                    <Breadcrumb />
                </div>
                <NetworkTps />
                <NetworkSelector />
                <WalletMultiButton />
            </div>
        </nav>
    )
}

export default Navbar
