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
        const nfts = await metaplex.nfts().findAllByCandyMachine(new PublicKey(account))
        console.log('nfts', nfts)

        const result = []
        for (let i = 0; i < nfts.length; i++) {
            let fetchImage = await fetch(nfts[i].uri)

            let imageData = await fetchImage.json()
            console.log('imageData', imageData)
            let tokenData = {
                name: nfts[i].name,
                imageLink: imageData.image,
                description: imageData.description,
                collection: imageData.collection,
                symbol: imageData.symbol,
            }
            result.push(tokenData)
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
                    {message.length !== 0 ? <span className='mt-8'>{message}</span> : <Carousel token={tokens} />}
                </div>
            ) : (
                <CheckConnectedWallet />
            )}
        </>
    )
}

export default ViewCandyMachine
