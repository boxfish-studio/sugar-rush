import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Title, CheckConnectedWallet, Carousel, Spinner } from 'components'
import Head from 'next/head'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { Nft } from 'lib/nft/interfaces'
import { getAllNftsByCM } from 'lib/nft/actions'

const ViewCandyMachine: NextPage = () => {
    const router = useRouter()
    const candyMachineAccount = router.query.id
    const { connected, publicKey } = useWallet()
    const [nfts, setNfts] = useState<Nft[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const { connection } = useConnection()

    async function getNfts() {
        if (!candyMachineAccount) return
        setIsLoading(true)
        setMessage('')
        setNfts([])
        const nfts = await getAllNftsByCM(candyMachineAccount, connection)
        setNfts(nfts)
        setIsLoading(false)
    }

    useEffect(() => {
        getNfts()
    }, [])

    return (
        <>
            <Head>
                <title>View Candy Machine Nfts</title>
                <meta name='description' content='Generated by create next app' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            {connected ? (
                <div className='flex justify-center items-center flex-col text-center'>
                    <Title text='View Candy Machine Nfts' />
                    <span className='mt-8'>
                        {candyMachineAccount}{' '}
                        <div className='mt-5'>
                            <a
                                className='text-blue-700 mt-4 mr-2'
                                href={`https://solscan.io/account/${candyMachineAccount}${
                                    connection.rpcEndpoint.includes('devnet') ? '?cluster=devnet' : ''
                                }`}
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                View in Solscan
                            </a>
                            -
                            <a
                                className='text-blue-700 mt-4 ml-2'
                                href={`https://solana.fm/address/${candyMachineAccount}${
                                    connection.rpcEndpoint.includes('devnet') ? '?cluster=devnet-solana' : ''
                                }`}
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                View in Solana.fm
                            </a>
                        </div>
                    </span>
                    {isLoading && <Spinner />}
                    {message.length !== 0 ? (
                        <span className='mt-8'>{message}</span>
                    ) : (
                        <Carousel
                            carouselData={nfts.map((nft) => ({
                                title: nft.name,
                                image: nft.imageLink,
                            }))}
                        />
                    )}
                </div>
            ) : (
                <CheckConnectedWallet />
            )}
        </>
    )
}

export default ViewCandyMachine
