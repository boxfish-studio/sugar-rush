import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Title, CheckConnectedWallet, Carousel, Spinner } from 'components/layout'
import Head from 'next/head'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'
import { Token } from 'lib/candy-machine/view/interfaces'
import { Metaplex } from '@metaplex-foundation/js'

const ViewCandyMachine: NextPage = () => {
    const router = useRouter()
    const account = router.query.id
    const { connected, publicKey } = useWallet()
    const [tokens, setTokens] = useState<Token[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const { connection } = useConnection()

    async function getTokens() {
        if (!account) return
        setIsLoading(true)
        setMessage('')
        setTokens([])
        const metaplex = new Metaplex(connection)
        // const nfts = await metaplex.nfts().findAllByCandyMachine(new PublicKey(account))
        const nfts = [
            {
                metadataAccount: {
                    publicKey: '94FCDNwLM6QY4PRGUG1qFRu3ZbxUMpvmea3aJ3HRYwui',
                    exists: true,
                    data: {
                        key: 4,
                        updateAuthority: 'EvajgaETGbFp4QdHmk9Jxcq9VscHPuVuuWjHsAUw6bLs',
                        mint: 'G5LJ55m2x9eti95LgLd34yuwFuBsUA9MvKDbLfeAEEYJ',
                        data: {
                            name: 'BOX NFT #1\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                            symbol: 'BOX\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                            uri: 'https://arweave.net/OgKO4stq_290ohCM0r1q8fdL232drp1Rh9wV-vjy--w\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                            sellerFeeBasisPoints: 500,
                            creators: [
                                {
                                    address: '4b6FYGzoFoUEi6W6VFyyzfvqC44sDPYYgDsevXbiY9NE',
                                    verified: true,
                                    share: 0,
                                },
                                {
                                    address: 'BoX451MZzydoVdZE4NFfmMT3J5Ztqo7YgUNbwwMfjPFu',
                                    verified: false,
                                    share: 100,
                                },
                            ],
                        },
                        primarySaleHappened: true,
                        isMutable: false,
                        editionNonce: 255,
                        tokenStandard: 0,
                        collection: null,
                        uses: null,
                        collectionDetails: null,
                    },
                    executable: false,
                    lamports: 5616720,
                    owner: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                    rentEpoch: 333,
                },
                metadataTask: {
                    status: 'pending',
                    children: [],
                    context: {},
                    eventEmitter: {
                        _events: {},
                        _eventsCount: 0,
                    },
                },
                editionTask: {
                    status: 'pending',
                    children: [],
                    context: {},
                    eventEmitter: {
                        _events: {},
                        _eventsCount: 0,
                    },
                },
                updateAuthority: 'EvajgaETGbFp4QdHmk9Jxcq9VscHPuVuuWjHsAUw6bLs',
                mint: 'G5LJ55m2x9eti95LgLd34yuwFuBsUA9MvKDbLfeAEEYJ',
                name: 'BOX NFT #1',
                symbol: 'BOX',
                uri: 'https://arweave.net/OgKO4stq_290ohCM0r1q8fdL232drp1Rh9wV-vjy--w',
                sellerFeeBasisPoints: 500,
                creators: [
                    {
                        address: '4b6FYGzoFoUEi6W6VFyyzfvqC44sDPYYgDsevXbiY9NE',
                        verified: true,
                        share: 0,
                    },
                    {
                        address: 'BoX451MZzydoVdZE4NFfmMT3J5Ztqo7YgUNbwwMfjPFu',
                        verified: false,
                        share: 100,
                    },
                ],
                primarySaleHappened: true,
                isMutable: false,
                editionNonce: 255,
                tokenStandard: 0,
                collection: null,
                uses: null,
            },
            {
                metadataAccount: {
                    publicKey: '7MUNw4G1HxVLe89HiPfUGuzceQW9i3S57fAoyEfgQdZj',
                    exists: true,
                    data: {
                        key: 4,
                        updateAuthority: 'EvajgaETGbFp4QdHmk9Jxcq9VscHPuVuuWjHsAUw6bLs',
                        mint: '8j7nX3xTfXJP6eickwf6T4CBcK9RUuFDjHLEjewc6tNn',
                        data: {
                            name: 'BOX NFT #2\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                            symbol: 'BOX\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                            uri: 'https://arweave.net/he62yPQ7oS2tTVDWjCl6ppDkynZquEL_BWpF4Tqrw3I\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                            sellerFeeBasisPoints: 500,
                            creators: [
                                {
                                    address: '4b6FYGzoFoUEi6W6VFyyzfvqC44sDPYYgDsevXbiY9NE',
                                    verified: true,
                                    share: 0,
                                },
                                {
                                    address: 'BoX451MZzydoVdZE4NFfmMT3J5Ztqo7YgUNbwwMfjPFu',
                                    verified: false,
                                    share: 100,
                                },
                            ],
                        },
                        primarySaleHappened: true,
                        isMutable: false,
                        editionNonce: 255,
                        tokenStandard: 0,
                        collection: null,
                        uses: null,
                        collectionDetails: null,
                    },
                    executable: false,
                    lamports: 5616720,
                    owner: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                    rentEpoch: 333,
                },
                metadataTask: {
                    status: 'pending',
                    children: [],
                    context: {},
                    eventEmitter: {
                        _events: {},
                        _eventsCount: 0,
                    },
                },
                editionTask: {
                    status: 'pending',
                    children: [],
                    context: {},
                    eventEmitter: {
                        _events: {},
                        _eventsCount: 0,
                    },
                },
                updateAuthority: 'EvajgaETGbFp4QdHmk9Jxcq9VscHPuVuuWjHsAUw6bLs',
                mint: '8j7nX3xTfXJP6eickwf6T4CBcK9RUuFDjHLEjewc6tNn',
                name: 'BOX NFT #2',
                symbol: 'BOX',
                uri: 'https://arweave.net/he62yPQ7oS2tTVDWjCl6ppDkynZquEL_BWpF4Tqrw3I',
                sellerFeeBasisPoints: 500,
                creators: [
                    {
                        address: '4b6FYGzoFoUEi6W6VFyyzfvqC44sDPYYgDsevXbiY9NE',
                        verified: true,
                        share: 0,
                    },
                    {
                        address: 'BoX451MZzydoVdZE4NFfmMT3J5Ztqo7YgUNbwwMfjPFu',
                        verified: false,
                        share: 100,
                    },
                ],
                primarySaleHappened: true,
                isMutable: false,
                editionNonce: 255,
                tokenStandard: 0,
                collection: null,
                uses: null,
            },
            {
                metadataAccount: {
                    publicKey: '2FMcjqWy7dvBUfbYQzE9BavFqmtsTckQgkVxQZtiBG2q',
                    exists: true,
                    data: {
                        key: 4,
                        updateAuthority: 'EvajgaETGbFp4QdHmk9Jxcq9VscHPuVuuWjHsAUw6bLs',
                        mint: '7QJbAFsgC1XemxYukTi86zJxASeZN3ap6jNT745AQak7',
                        data: {
                            name: 'BOX NFT #0\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                            symbol: 'BOX\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                            uri: 'https://arweave.net/VUpRvogholzacRgo8MCAS-skps1xxfXPst4T2ElZYg4\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                            sellerFeeBasisPoints: 500,
                            creators: [
                                {
                                    address: '4b6FYGzoFoUEi6W6VFyyzfvqC44sDPYYgDsevXbiY9NE',
                                    verified: true,
                                    share: 0,
                                },
                                {
                                    address: 'BoX451MZzydoVdZE4NFfmMT3J5Ztqo7YgUNbwwMfjPFu',
                                    verified: false,
                                    share: 100,
                                },
                            ],
                        },
                        primarySaleHappened: true,
                        isMutable: false,
                        editionNonce: 255,
                        tokenStandard: 0,
                        collection: null,
                        uses: null,
                        collectionDetails: null,
                    },
                    executable: false,
                    lamports: 5616720,
                    owner: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                    rentEpoch: 333,
                },
                metadataTask: {
                    status: 'pending',
                    children: [],
                    context: {},
                    eventEmitter: {
                        _events: {},
                        _eventsCount: 0,
                    },
                },
                editionTask: {
                    status: 'pending',
                    children: [],
                    context: {},
                    eventEmitter: {
                        _events: {},
                        _eventsCount: 0,
                    },
                },
                updateAuthority: 'EvajgaETGbFp4QdHmk9Jxcq9VscHPuVuuWjHsAUw6bLs',
                mint: '7QJbAFsgC1XemxYukTi86zJxASeZN3ap6jNT745AQak7',
                name: 'BOX NFT #0',
                symbol: 'BOX',
                uri: 'https://arweave.net/VUpRvogholzacRgo8MCAS-skps1xxfXPst4T2ElZYg4',
                sellerFeeBasisPoints: 500,
                creators: [
                    {
                        address: '4b6FYGzoFoUEi6W6VFyyzfvqC44sDPYYgDsevXbiY9NE',
                        verified: true,
                        share: 0,
                    },
                    {
                        address: 'BoX451MZzydoVdZE4NFfmMT3J5Ztqo7YgUNbwwMfjPFu',
                        verified: false,
                        share: 100,
                    },
                ],
                primarySaleHappened: true,
                isMutable: false,
                editionNonce: 255,
                tokenStandard: 0,
                collection: null,
                uses: null,
            },
        ]
        console.log('nfts', nfts)

        const result = []
        for (let i = 0; i < nfts.length; i++) {
            let fetchToken = await fetch(nfts[i].uri)

            let tokenData = await fetchToken.json()
            let token = {
                name: tokenData.name,
                imageLink: tokenData.image,
                description: tokenData.description,
                collection: tokenData.collection,
                symbol: tokenData.symbol,
            }
            result.push(token)
        }

        setTokens(result)
        setIsLoading(false)
    }

    useEffect(() => {
        getTokens()
    }, [])

    return (
        <>
            <Head>
                <title>View Candy Machine Tokens</title>
                <meta name='description' content='Generated by create next app' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            {connected ? (
                <div className='flex justify-center items-center flex-col text-center'>
                    <Title text='View Candy Machine Tokens' />
                    <span className='mt-8'>
                        {account}{' '}
                        <a
                            className='text-blue-700'
                            href={`https://solscan.io/account/${account}${
                                connection.rpcEndpoint.includes('devnet') ? '?cluster=devnet' : ''
                            }`}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            View in Solscan
                        </a>
                    </span>
                    {isLoading && <Spinner />}
                    {message.length !== 0 ? <span className='mt-8'>{message}</span> : <Carousel tokens={tokens} />}
                </div>
            ) : (
                <CheckConnectedWallet />
            )}
        </>
    )
}

export default ViewCandyMachine
