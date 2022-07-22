import { FC, useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'
import { networkState } from 'lib/recoil-store/atoms'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { Connection } from '@solana/web3.js'

type Network = keyof typeof WalletAdapterNetwork

const RPC_API_DEVNET = process.env.NEXT_PUBLIC_RPC_API_DEVNET as string
const RPC_API_MAINNET = process.env.NEXT_PUBLIC_RPC_API_MAINNET as string

function getUrl(network: Network): string {
    switch (network) {
        case 'Devnet':
            return RPC_API_DEVNET
        case 'Mainnet':
            return RPC_API_MAINNET
        default:
            throw new Error(`Unknown network: ${network}`)
    }
}

const NetworkSelector: FC = () => {
    const [network, setNetwork] = useRecoilState(networkState)

    const detailsRef = useRef<HTMLDetailsElement>(null)
    function hideUl() {
        detailsRef.current!.removeAttribute('open')
    }

    useEffect(() => {
        const _network = window.localStorage.getItem('network-gg') as Network | null
        if (_network === 'Devnet' || _network === 'Mainnet' || _network === 'Testnet') {
            setNetwork({ network: _network, url: getUrl(_network), connection: new Connection(getUrl(_network)) })
            window.localStorage.setItem('network-gg', _network)
        }
    }, [])
    function changeNetwork(_network: Network) {
        setNetwork({ network: _network, url: getUrl(_network), connection: new Connection(getUrl(_network)) })
        hideUl()
        window.localStorage.setItem('network-gg', _network)
    }

    return (
        <div className='pr-4 cursor-default'>
            <details
                id='details'
                className='dropdown details-reset details-overlay d-inline-block cursor-pointer'
                ref={detailsRef}
            >
                <summary className='btn' aria-haspopup='true'>
                    {network?.network || 'Select Network'}
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
