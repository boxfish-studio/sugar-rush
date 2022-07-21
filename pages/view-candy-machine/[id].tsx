import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Title, Carousel, Spinner, NftDetails, ExplorerLinks } from 'components'
import Head from 'next/head'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { Nft } from 'lib/nft/interfaces'
import { getAllNftsByCM } from 'lib/nft/actions'
import { useRPC } from 'hooks'

const ViewCandyMachine: NextPage = () => {
    const router = useRouter()
    const candyMachineAccount = router.query.id
    const { connected } = useWallet()
    const [nfts, setNfts] = useState<Nft[]>([])
    const [nftDetails, setNftDetails] = useState<Nft>()
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const { rpcEndpoint } = useRPC()

    async function getNfts() {
        if (!candyMachineAccount) return
        setIsLoading(true)
        setMessage('')
        setNfts([])
        try {
            let nfts = await getAllNftsByCM(candyMachineAccount, rpcEndpoint)
            if (nfts.length === 0) setMessage('Assets not found')
            setNfts(nfts)
        } catch (e: any) {
            setMessage(e.message)
        }
        setIsLoading(false)
    }

    function onClickSlide(e: any) {
        const nameNft = e.target.alt
        if (nfts.length !== 0) {
            const viewNft = nfts.filter((e) => e.name === nameNft)[0]
            setNftDetails(viewNft)
        } else {
            setNftDetails(undefined)
        }
    }

    function refresh() {
        setNftDetails(undefined)
    }

    useEffect(() => {
        if (connected) {
            getNfts()
        }
    }, [candyMachineAccount, rpcEndpoint, connected])

    return (
        <>
            <Head>
                <title>View Candy Machine Nfts</title>
                <meta name='description' content='Generated by create next app' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <div className='flex justify-center items-center flex-column text-center'>
                <Title text='View Candy Machine Nfts' />
                <span className='mt-8'>
                    {candyMachineAccount}{' '}
                    <ExplorerLinks
                        type='account'
                        value={candyMachineAccount as string}
                        connection={rpcEndpoint}
                        text={'View'}
                    />
                </span>
                {isLoading ? (
                    <Spinner />
                ) : (
                    <>
                        {message.length === 0 ? (
                            <>
                                <Carousel
                                    carouselData={nfts.map((nft) => ({
                                        title: nft.name,
                                        image: nft.image,
                                    }))}
                                    onClick={onClickSlide}
                                    slideChange={refresh}
                                />
                                <span className='text-[hsl(258,52%,56%)] text-center mt-6'>
                                    Click the img to view Nft details
                                </span>
                            </>
                        ) : (
                            <span className='mt-8'>{message}</span>
                        )}
                    </>
                )}
                {nftDetails && <NftDetails nft={nftDetails} />}
            </div>
        </>
    )
}

export default ViewCandyMachine
