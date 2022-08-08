import { Button, Link, Text } from '@primer/react'
import { getAllNftsByCM, getNftByMint } from 'lib/nft/actions'
import { Nft } from 'lib/nft/interfaces'
import { nftsState } from 'lib/recoil-store/atoms'
import {
    Popup,
    RefreshButton,
    UpdateCandyMachine,
    DeleteCandyMachine,
    VerifyCandyMachine,
    PreviewNFTs,
    MintedNFTs,
    NftCollection,
} from 'components'
import { useEffect, useState } from 'react'
import { useRPC, useRefreshCandyMachine } from 'hooks'
import { useRecoilState } from 'recoil'
import { useRouter } from 'next/router'
import Head from 'next/head'
import type { NextPage } from 'next'
import { LinkExternalIcon } from '@primer/octicons-react'

const CandyMachine: NextPage = () => {
    const router = useRouter()

    const candyMachineAccount = router.query.candy_machine_ID as string

    const { connection, isDevnet } = useRPC()
    const [error, setError] = useState('')
    const [isLoadingNfts, setIsLoadingNfts] = useState(false)
    const [collectionNft, setCollectionNft] = useState<Nft>()
    const { itemsRemaining, refreshCandyMachineState, setIsCaptcha, itemsAvailable } = useRefreshCandyMachine(
        candyMachineAccount as string
    )
    const [nftsRecoilState, setNftsRecoilState] = useRecoilState(nftsState)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isVerifyOpen, setIsVerifyOpen] = useState(false)

    const fetchNfts = async () => {
        setIsLoadingNfts(true)
        setError('')
        try {
            if (!connection) return
            const nfts = await getAllNftsByCM(candyMachineAccount, connection)
            setNftsRecoilState(nfts)
            // @ts-ignore
            if (nfts[0]?.collection?.key) {
                // @ts-ignore
                let nftCollectionData = await getNftByMint(nfts[0].collection.key, connection)
                if (nftCollectionData.name !== '') {
                    setCollectionNft(nftCollectionData)
                }
            }
        } catch (err) {
            setNftsRecoilState([])
            setError((err as Error).message)
            console.error(err)
        }
        setIsLoadingNfts(false)
    }

    const reloadMintCard = (value: boolean) => setIsCaptcha(value)

    useEffect(() => {
        setError('')
        refreshCandyMachineState()
    }, [connection])

    useEffect(() => {
        fetchNfts()
    }, [])

    if (error.includes('Account does not exist')) {
        return (
            <>
                <Head>
                    <title>Update Candy Machine</title>
                    <meta name='description' content='Generated by create next app' />
                    <link rel='icon' href='/favicon.ico' />
                </Head>
                <div className='d-flex flex-column flex-items-center flex-justify-center mt-11 f2'>
                    This is not a candy machine account.
                </div>
            </>
        )
    }
    return (
        <>
            <Head>
                <title>Update Candy Machine</title>
                <meta name='description' content='Generated by create next app' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <div className='d-flex flex-justify-end column-gap-1 flex-row flex-md-row'>
                <Button variant='danger' onClick={() => setIsDeleteOpen(true)}>
                    Delete
                </Button>
                <Button variant='outline' onClick={() => setIsVerifyOpen(true)}>
                    Verify
                </Button>
                <Button leadingIcon={LinkExternalIcon}>
                    <Link
                        target='_blank'
                        href={`https://solscan.io/account/${candyMachineAccount}?${isDevnet}`}
                        sx={{ textDecoration: 'none', color: '#24292F' }}
                    >
                        View in Solscan
                    </Link>
                </Button>
            </div>
            <div className='d-flex flex-justify-center flex-column'>
                <h2 className='my-5 wb-break-all'>[CM]: {candyMachineAccount}</h2>
                <UpdateCandyMachine candyMachineAccount={candyMachineAccount} reloadMintCard={reloadMintCard} />
                <div className='d-flex flex-justify-center flex-items-start flex-column mb-10 width-full p-0'>
                    <div className='d-flex flex-justify-between flex-items-center width-full mb-4'>
                        <h3 className='r-0'>NFTs</h3>
                        <div className='l-0 d-flex flex-justify-end flex-items-center'>
                            <span className='pr-2'>
                                {isLoadingNfts ? '' : `${nftsRecoilState?.length}/${itemsAvailable} Minted`}
                            </span>
                            <RefreshButton onClick={fetchNfts} isLoading={isLoadingNfts} />
                        </div>
                    </div>
                    <div className='border-y width-full' />
                    {collectionNft && <NftCollection nft={collectionNft} />}
                    <PreviewNFTs
                        candyMachineAccount={candyMachineAccount}
                        itemsRemaining={itemsRemaining}
                        mintedNfts={nftsRecoilState}
                    />
                    {error?.includes('Error to fetch data') && (
                        <Text as='p' className='mt-3 mb-4'>
                            Error to fetch data. Please, click the refresh button to try again.
                        </Text>
                    )}
                    <MintedNFTs
                        candyMachineAccount={candyMachineAccount}
                        fetchNfts={fetchNfts}
                        nfts={nftsRecoilState}
                        isLoading={isLoadingNfts}
                    />
                </div>
            </div>
            {isDeleteOpen && (
                <Popup onClose={() => setIsDeleteOpen(false)} title='Delete Candy Machine' size='small'>
                    <DeleteCandyMachine candyMachineAccount={candyMachineAccount as string} />
                </Popup>
            )}
            {isVerifyOpen && (
                <Popup onClose={() => setIsVerifyOpen(false)} title='Verify Candy Machine' size='small'>
                    <VerifyCandyMachine candyMachineAccount={candyMachineAccount as string} />
                </Popup>
            )}
        </>
    )
}

export default CandyMachine
