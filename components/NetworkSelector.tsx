import { FC, useEffect, useRef, useState } from 'react'
import { useRecoilState } from 'recoil'
import { networkState } from 'lib/recoil-store/atoms'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

type Network = keyof typeof WalletAdapterNetwork

const NetworkSelector: FC = () => {
    const [, setNetwork] = useRecoilState(networkState)
    const [currentNetwork, setCurrentNetwork] = useState('Mainnet' as Network)

    const detailsRef = useRef<HTMLDetailsElement>(null)
    function hideUl() {
        detailsRef.current!.removeAttribute('open')
    }
    useEffect(() => {
        const _network = window.localStorage.getItem('network-gg') as Network | null
        if (_network) {
            setNetwork(WalletAdapterNetwork[_network])
            window.localStorage.setItem('network-gg', _network)
            setCurrentNetwork(_network)
        }
    }, [])
    function changeNetwork(_network: Network) {
        setNetwork(WalletAdapterNetwork[_network as Network])
        setCurrentNetwork(_network as Network)
        hideUl()
        window.localStorage.setItem('network-gg', _network)
    }

    return (
        <div className='pr-4'>
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
                            .map((_network) => (
                                <li
                                    className='dropdown-item'
                                    key={_network}
                                    onClick={() => changeNetwork(_network as Network)}
                                >
                                    {_network}
                                </li>
                            ))}
                    </ul>
                }
            </details>
        </div>
    )
}

export default NetworkSelector
