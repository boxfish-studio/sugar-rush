import { FC, useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'
import { networkState } from 'lib/recoil-store/atoms'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

type Network = keyof typeof WalletAdapterNetwork

const NetworkSelector: FC = () => {
    const [network, setNetwork] = useRecoilState(networkState)
    const currentNetwork = Object.keys(WalletAdapterNetwork).find((e) => WalletAdapterNetwork[e as Network] === network)

    const detailsRef = useRef<HTMLDetailsElement>(null)
    function hideUl() {
        detailsRef.current!.removeAttribute('open')
    }
    useEffect(() => {
        const _network = window.localStorage.getItem('network-gg') as WalletAdapterNetwork | null
        if (_network) {
            setNetwork(_network)
        }
    }, [])
    return (
        <div className='pr-4 cursor-default'>
            <details
                id='details'
                className='dropdown details-reset details-overlay d-inline-block cursor-pointer'
                ref={detailsRef}
            >
                <summary className='btn' aria-haspopup='true'>
                    {currentNetwork}
                    <span className='dropdown-caret'></span>
                </summary>
                {
                    <ul id='ul' className='dropdown-menu dropdown-menu-se  mt-2'>
                        {Object.keys(WalletAdapterNetwork)
                            .filter((e) => e !== 'Testnet')
                            .map((network) => (
                                <li
                                    className='dropdown-item'
                                    key={network}
                                    onClick={() => {
                                        setNetwork(WalletAdapterNetwork[network as Network])
                                        hideUl()
                                    }}
                                >
                                    {network}
                                </li>
                            ))}
                    </ul>
                }
            </details>
        </div>
    )
}

export default NetworkSelector
