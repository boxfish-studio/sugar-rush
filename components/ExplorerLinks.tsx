import { Connection } from '@solana/web3.js'
import { Title } from 'components'
import { FC } from 'react'

const ExplorerLinks: FC<{
    type: 'account' | 'transaction'
    value: string
    connection: Connection
    text: string
}> = ({ type, value, connection, text }) => {
    const solscanType = type === 'account' ? 'account' : 'tx'
    const solanaFmType = type === 'account' ? 'address' : 'tx'
    return (
        <div className={`${type === 'account' && 'mt-5'}`}>
            <a
                className='text-[hsl(258,52%,56%)] mt-4 mr-2'
                href={`https://solscan.io/${solscanType}/${value}${
                    connection.rpcEndpoint.includes('devnet') ? '?cluster=devnet' : ''
                }`}
                target='_blank'
                rel='noopener noreferrer'
            >
                {text} in Solscan
            </a>
            -
            <a
                className='text-[hsl(258,52%,56%)] mt-4 ml-2'
                href={`https://solana.fm/${solanaFmType}/${value}${
                    connection.rpcEndpoint.includes('devnet') ? '?cluster=devnet-solana' : ''
                }`}
                target='_blank'
                rel='noopener noreferrer'
            >
                {text} in Solana.fm
            </a>
        </div>
    )
}

export default ExplorerLinks
