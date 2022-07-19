import { useConnection } from '@solana/wallet-adapter-react'
import { Link, Button, Text, IconButton } from '@primer/react'
import { FC } from 'react'
import { LinkExternalIcon } from '@primer/octicons-react'

const NftCard: FC<{ title: string; imageLink: string; hash?: string }> = ({ title, imageLink, hash }) => {
    const { connection } = useConnection()
    const image = imageLink !== '' ? imageLink : '/default-image.png'
    return (
        <div
            className='d-flex flex-column flex-justify-center flex-items-center border rounded-3 gap-2 py-2'
            style={{ width: '185px' }}
        >
            <Text as='p' fontWeight='bold'>
                {title}
            </Text>
            <div
                className='border rounded-3 mb-2 overflow-hidden d-flex flex-items-center flex-justify-center'
                style={{ height: '168px', width: '168px' }}
            >
                <img alt={title} src={image} />
            </div>
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
