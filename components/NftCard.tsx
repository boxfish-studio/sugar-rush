import { useConnection } from '@solana/wallet-adapter-react'
import { Link, Text, Button, Spinner } from '@primer/react'
import { FC } from 'react'
import { LinkExternalIcon } from '@primer/octicons-react'
import { VariantType } from '@primer/react/lib/Button/types'

const NftCard: FC<{
    title: string
    imageLink?: string
    hash?: string
    buttonProps?: { text: string; isLoading: boolean; variant: VariantType; onClick: () => void }
}> = ({ title, imageLink, hash, buttonProps }) => {
    const { connection } = useConnection()
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
            {buttonProps && (
                <Button variant={buttonProps.variant} onClick={() => buttonProps.onClick()}>
                    <div className={'d-flex flex-row flex-justify-center flex-items-center'}>
                        {buttonProps.isLoading && <Spinner sx={{ mr: 2 }} size='small' />}
                        {buttonProps.text}
                    </div>
                </Button>
            )}
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
