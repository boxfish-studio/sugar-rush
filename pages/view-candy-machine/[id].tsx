import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Title, CheckConnectedWallet, Carousel, Spinner, NftDetails } from 'components'
import Head from 'next/head'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { Nft } from 'lib/nft/interfaces'
import { getAllNftsByCM } from 'lib/nft/actions'
import { AnchorProvider, Program } from '@project-serum/anchor'
import { useRPC } from 'hooks'
import { CANDY_MACHINE_PROGRAM_V2_ID } from 'lib/candy-machine/constants'
import { PublicKey } from '@solana/web3.js'

const ViewCandyMachine: NextPage = () => {
    const router = useRouter()
    const candyMachineAccount = router.query.id
    const wallet = useWallet()
    const [nfts, setNfts] = useState<Nft[]>([])
    const [selectNft, setSelectNft] = useState<Nft>()
    const [isLoading, setIsLoading] = useState(false)
    const [isMutable, setIsMutable] = useState(false)
    const [message, setMessage] = useState('')
    const { connection } = useConnection()
    const anchorWallet = useAnchorWallet()
    const { rpcEndpoint } = useRPC()

    async function getNfts() {
        if (!candyMachineAccount) return
        setIsLoading(true)
        setMessage('')
        setNfts([])
        let nfts = await getAllNftsByCM(candyMachineAccount, connection)
        if (nfts.length === 0) setMessage('Assets not found')
        setNfts(nfts)
        setIsLoading(false)
    }

    function onClickSlide(e: any) {
        const nameNft = e.target.alt
        if (nfts.length !== 0) {
            const viewNft = nfts.filter((e) => e.name === nameNft)[0]
            setSelectNft(viewNft)
        } else {
            setSelectNft(undefined)
        }
    }

    function refresh() {
        setSelectNft(undefined)
    }

    async function checkMutable() {
        if (!anchorWallet || !wallet.publicKey || !candyMachineAccount) return
        const provider = new AnchorProvider(rpcEndpoint, anchorWallet, {
            preflightCommitment: 'recent',
        })

        const idl = await Program.fetchIdl(CANDY_MACHINE_PROGRAM_V2_ID, provider)

        const program = new Program(idl!, CANDY_MACHINE_PROGRAM_V2_ID, provider)
        const state: any = await program.account.candyMachine.fetch(new PublicKey(candyMachineAccount))
        const mutable = !!state.data.isMutable
        setIsMutable(mutable)
    }

    useEffect(() => {
        if (wallet.connected) {
            getNfts()
            checkMutable()
        }
    }, [candyMachineAccount, connection, wallet.connected])

    return (
        <>
            <Head>
                <title>View Candy Machine Nfts</title>
                <meta name='description' content='Generated by create next app' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            {wallet.connected ? (
                <div className='flex justify-center items-center flex-col text-center'>
                    <Title text='View Candy Machine Nfts' />
                    <span className='mt-8'>
                        {candyMachineAccount}{' '}
                        <a
                            className='text-blue-700'
                            href={`https://solscan.io/account/${candyMachineAccount}${
                                connection.rpcEndpoint.includes('devnet') ? '?cluster=devnet' : ''
                            }`}
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            View in Solscan
                        </a>
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
                    {selectNft && (
                        <>
                            <NftDetails nft={selectNft} isMutable={isMutable} />
                        </>
                    )}
                </div>
            ) : (
                <CheckConnectedWallet />
            )}
        </>
    )
}

export default ViewCandyMachine
