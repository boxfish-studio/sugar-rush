import { Account } from 'lib/candy-machine/types'
import { AnchorProvider, Program } from '@project-serum/anchor'
import { CANDY_MACHINE_PROGRAM_V2_ID } from 'lib/candy-machine/constants'
import { Connection, PublicKey } from '@solana/web3.js'
import { getNftByMint, getAllNftsByCM } from 'lib/nft/actions'
import { IFetchedCandyMachineConfig } from 'lib/candy-machine/interfaces'
import { Nft } from 'lib/nft/interfaces'
import { nftsState } from 'lib/recoil-store/atoms'
import { Spinner } from '@primer/react'
import { Title, UpdateCreateCandyMachineForm, Carousel, ExplorerLinks, NftCard, RefreshButton } from 'components'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { useMintCandyMachine } from 'hooks'
import { useRecoilState } from 'recoil'
import { useRouter } from 'next/router'
import Head from 'next/head'
import type { NextPage } from 'next'

const CandyMachine: NextPage = () => {
    const router = useRouter()
    const candyMachineAccount = router.query.id as string

    const anchorWallet = useAnchorWallet()
    const { connection } = useConnection()
    const [candyMachineConfig, setCandyMachineConfig] = useState<IFetchedCandyMachineConfig>()
    const [error, setError] = useState('')
    const [isLoadingNfts, setIsLoadingNfts] = useState(false)
    const [nfts, setNfts] = useState<Nft[]>([])
    const [mintedNfts, setMintedNfts] = useState<Nft[]>([])
    const [collectionNft, setCollectionNft] = useState<Nft>()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { isUserMinting, itemsRemaining, mintAccount, refreshCandyMachineState } = useMintCandyMachine(
        candyMachineAccount as string
    )
    const [hasCollection, setHasCollection] = useState<boolean>(false)
    const [nftsRecoilState, setNftsRecoilState] = useRecoilState(nftsState)

    const viewNfts = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoadingNfts(true)
        if (!e.target.files || e.target.files.length == 0) {
            window.alert('No files uploaded')
            return
        }
        let cacheData = await e.target.files[0].text()
        let cacheDataJson = JSON.parse(cacheData)
        if (cacheDataJson?.program?.candyMachine === candyMachineAccount) {
            const nfts = Object.values(cacheDataJson.items).map((nft: any) => {
                return {
                    image: nft.imageLink,
                    name: nft.name,
                }
            })

            setNfts(nfts)
        } else {
            alert('This cache file is not from this candy machine')
        }
        setIsLoadingNfts(false)
    }

    const fetchCandyMachine = async ({
        candyMachineAccount,
        connection,
    }: {
        candyMachineAccount: Account
        connection: Connection
    }): Promise<IFetchedCandyMachineConfig | undefined> => {
        if (candyMachineAccount && anchorWallet) {
            try {
                setIsLoading(true)
                const provider = new AnchorProvider(connection, anchorWallet, {
                    preflightCommitment: 'processed',
                })

                const idl = await Program.fetchIdl(CANDY_MACHINE_PROGRAM_V2_ID, provider)

                const program = new Program(idl!, CANDY_MACHINE_PROGRAM_V2_ID, provider)

                const state: any = await program.account.candyMachine.fetch(new PublicKey(candyMachineAccount))

                state.data.solTreasuryAccount = state.wallet
                state.data.itemsRedeemed = state.itemsRedeemed
                setIsLoading(false)

                return state.data
            } catch (err) {
                console.error(err)
                setIsLoading(false)
                setError((err as Error).message)
            }
        }
    }

    const fetchNfts = async () => {
        setIsLoadingNfts(true)
        try {
            const nfts = await getAllNftsByCM(candyMachineAccount, connection)
            setMintedNfts(nfts)
            setNftsRecoilState(nfts)
            // @ts-ignore
            if (nfts[0]?.collection?.key) {
                setHasCollection(true)
                // @ts-ignore
                let nftCollectionData = await getNftByMint(nfts[0].collection.key, connection)
                if (nftCollectionData.name !== '') {
                    setCollectionNft(nftCollectionData)
                }
            }
        } catch (e) {
            setNftsRecoilState([])
            console.error(e)
        }
        setIsLoadingNfts(false)
    }

    useEffect(() => {
        fetchNfts()
        refreshCandyMachineState()
        fetchCandyMachine({ candyMachineAccount, connection }).then(setCandyMachineConfig)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candyMachineAccount, connection, anchorWallet])

    if (isLoading) {
        return (
            <div className='d-flex flex-row'>
                <Spinner />
                <h1>Loading...</h1>
            </div>
        )
    }

    return (
        <>
            <Head>
                <title>Update Candy Machine</title>
                <meta name='description' content='Generated by create next app' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <div className='d-flex flex-justify-center flex-items-center flex-column'>
                <Title text='Update Candy Machine' />
                <div className='mt-8 d-flex flex-column text-center'>
                    <span className='break-all border border-slate-300 shadow-xl py-2 px-4 rounded-lg text-center'>
                        {candyMachineAccount}{' '}
                    </span>
                    <ExplorerLinks
                        type='account'
                        value={candyMachineAccount as string}
                        connection={connection}
                        text={'View'}
                    />
                </div>

                {error ? (
                    <div className='d-flex flex-column items-center justify-center mt-11'>
                        Error fetching candy machine config
                        <button
                            className='rounded-lg bg-slate-400 p-2 mt-4'
                            onClick={() => fetchCandyMachine({ candyMachineAccount, connection })}
                        >
                            Fetch again
                        </button>
                    </div>
                ) : (
                    candyMachineConfig?.uuid && (
                        <div className='mt-5 d-flex flex-column text-center'>
                            <span className='mt-5'>
                                {`There ${itemsRemaining === 1 ? 'is ' : 'are '}
                                ${itemsRemaining} unminted NFT.`}
                            </span>
                            <span className='mt-2'>{mintedNfts?.length} redeemed NFT.</span>
                            {itemsRemaining - mintedNfts?.length !== 0 && (
                                <>
                                    <label
                                        htmlFor='cache'
                                        className='m-8 px-4 py-2 border border-gray-500 inline-block cursor-pointer'
                                    >
                                        Upload Cache file to view NFTs
                                    </label>
                                    <input
                                        type='file'
                                        id='cache'
                                        name='cache'
                                        className='w-full px-2 hidden'
                                        onChange={viewNfts}
                                    />
                                </>
                            )}
                            {nfts.length !== 0 && (
                                <Carousel
                                    carouselData={nfts.map((nft) => ({
                                        title: nft.name,
                                        image: nft.image,
                                    }))}
                                />
                            )}
                            <UpdateCreateCandyMachineForm
                                fetchedValues={candyMachineConfig}
                                updateCandyMachine
                                candyMachinePubkey={candyMachineAccount}
                            />
                        </div>
                    )
                )}
                <div className='d-flex flex-justify-center flex-items-start flex-column width-full p-0'>
                    <div className='d-flex flex-justify-between flex-items-center width-full mb-4'>
                        <h3 className='r-0'>NFTs</h3>
                        <div className='l-0 d-flex flex-justify-end flex-items-center'>
                            <span className='mr-3'>
                                {isLoadingNfts
                                    ? ''
                                    : `${mintedNfts?.length}/${itemsRemaining + mintedNfts.length} Minted`}
                            </span>
                            <RefreshButton onClick={fetchNfts} isLoading={isLoadingNfts} />
                        </div>
                    </div>
                    <div className='border-y width-full' />
                </div>
                <div className='mt-4 width-full'>
                    {isLoadingNfts ? (
                        <h3 className='width-full text-center'>LOADING...</h3>
                    ) : (
                        <>
                            {hasCollection && (
                                <>
                                    <h4>Collection</h4>
                                    {collectionNft && (
                                        <div className='d-flex flex-justify-start flex-items-center gap-5 mt-3'>
                                            <NftCard
                                                title={collectionNft.name}
                                                imageLink={collectionNft.image}
                                                buttons={[
                                                    {
                                                        text: 'View in Solscan',
                                                        as: 'link',
                                                        variant: 'invisible',
                                                        hash: '14eoYMYLY19gtfE1gwWDhnjDD3fDjGTQTGyicBKT33Ns',
                                                    },
                                                ]}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                            <div className='mt-5'>
                                <h4>Minted NFTs - {mintedNfts.length}</h4>
                                <div className='mt-3 nfts-grid'>
                                    {itemsRemaining > mintedNfts.length && (
                                        <NftCard
                                            title={'New NFT'}
                                            buttons={[
                                                {
                                                    text: 'Mint 1 NFT',
                                                    isLoading: isUserMinting,
                                                    as: 'button',
                                                    variant: 'primary',
                                                    onClick: () => mintAccount().then(fetchNfts),
                                                },
                                            ]}
                                        />
                                    )}
                                    {mintedNfts.map(({ name, image, mint }, index) => (
                                        <NftCard
                                            title={name}
                                            imageLink={image}
                                            key={index}
                                            buttons={[
                                                {
                                                    text: 'View in Solscan',
                                                    as: 'link',
                                                    variant: 'invisible',
                                                    hash: mint?.toBase58(),
                                                },
                                            ]}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className='mt-5'>
                                <h4>Unminted NFTs - {itemsRemaining}</h4>
                                <div className='mt-3 nfts-grid'>
                                    {new Array(5).fill(0).map((_, index) => (
                                        <NftCard
                                            title={`CryptoDude #${index}`}
                                            imageLink={'/favicon.ico'}
                                            buttons={[
                                                {
                                                    text: 'View in Solscan',
                                                    as: 'link',
                                                    variant: 'invisible',
                                                    hash: '14eoYMYLY19gtfE1gwWDhnjDD3fDjGTQTGyicBKT33Ns',
                                                },
                                            ]}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default CandyMachine
