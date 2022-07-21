import { useRPC } from 'hooks'
import { FC } from 'react'

const ExplorerLinks: FC<{
    type: 'account' | 'transaction'
    value: string
    text: string
}> = ({ type, value, text }) => {
    const { connection, isDevnet } = useRPC()
    const solscanType = type === 'account' ? 'account' : 'tx'
    const solanaFmType = type === 'account' ? 'address' : 'tx'
    return (
        <div className={`${type === 'account' && 'mt-5'}`}>
            <a
                className='text-[hsl(258,52%,56%)] mt-4 mr-2'
                href={`https://solscan.io/${solscanType}/${value}${isDevnet}`}
                target='_blank'
                rel='noopener noreferrer'
            >
                {text} in Solscan
            </a>
            -
            <a
                className='text-[hsl(258,52%,56%)] mt-4 ml-2'
                href={`https://solana.fm/${solanaFmType}/${value}${isDevnet}`}
                target='_blank'
                rel='noopener noreferrer'
            >
                {text} in Solana.fm
            </a>
        </div>
    )
}

export default ExplorerLinks
