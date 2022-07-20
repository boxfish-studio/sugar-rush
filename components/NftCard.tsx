import { useConnection } from '@solana/wallet-adapter-react'
import { Link, Text, Button, Spinner } from '@primer/react'
import { FC } from 'react'
import { LinkExternalIcon } from '@primer/octicons-react'
import { VariantType } from '@primer/react/lib/Button/types'

const NftCard: FC<{
    title: string
    imageLink?: string
    hash?: string
    buttons?: { text: string; isLoading: boolean; variant: VariantType; onClick: () => void }[]
}> = ({ title, imageLink, hash, buttons }) => {
    const { connection } = useConnection()
    console.log(buttons)

    return (
        <div
            className='d-flex flex-column flex-justify-center flex-items-center border rounded-3 py-2'
            style={{ width: '185px' }}
        >
            <Text as='p' fontWeight='bold'>
                {title}
            </Text>
            <div
                className='border color-bg-inset rounded-3 mb-2 overflow-hidden d-flex flex-items-center flex-justify-center'
                style={{ height: '168px', width: '168px' }}
            >
                {imageLink && <img alt={title} src={imageLink} />}
            </div>
            {buttons?.length &&
                buttons.map((btn, i) => {
                    return (
                        <Button variant={btn.variant} onClick={() => btn.onClick()} key={i}>
                            <div className={'d-flex flex-row flex-justify-center flex-items-center'}>
                                {btn.isLoading && <Spinner sx={{ mr: 2 }} size='small' />}
                                {btn.text}
                            </div>
                        </Button>
                    )
                })}
            {hash && (
                <Link
                    target='_blank'
                    rel='noopener noreferrer'
                    href={`https://solscan.io/account/${hash}?${
                        connection.rpcEndpoint.includes('devnet') ? '?cluster=devnet' : ''
                    }`}
                >
                    <Button leadingIcon={LinkExternalIcon} variant='invisible'>
                        View in solscan
                    </Button>
                </Link>
            )}
        </div>
    )
}

export default NftCard
