import { AnchorProvider, Program } from '@project-serum/anchor'
import { Button, Link, Spinner, Text } from '@primer/react'
import { CANDY_MACHINE_PROGRAM_V2_ID } from 'lib/candy-machine/constants'
import { getAllNftsByCM, getNftByMint } from 'lib/nft/actions'
import { IFetchedCandyMachineConfig } from 'lib/candy-machine/interfaces'
import { Nft } from 'lib/nft/interfaces'
import { nftsState } from 'lib/recoil-store/atoms'
import { NftCard, Popup, RefreshButton, UpdateCandyMachine, DeleteCandyMachine, VerifyCandyMachine } from 'components'
import { FilterArrayContext, ArrayWrapper } from 'contexts/ArrayWrapper'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { useMintCandyMachine, useRPC } from 'hooks'
import { useRecoilState } from 'recoil'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'
import Head from 'next/head'
import type { NextPage } from 'next'
import { LinkExternalIcon } from '@primer/octicons-react'
import { ICollectionNft } from 'lib/nft/interfaces'
import { MINIMUM_NFTS_TO_SHOW } from 'lib/constants'

const CandyMachine: NextPage = () => {
    const router = useRouter()

    const candyMachineAccount = router.query.candy_machine_ID as string

    const anchorWallet = useAnchorWallet()
    const { connection, isDevnet } = useRPC()
    const [candyMachineConfig, setCandyMachineConfig] = useState<IFetchedCandyMachineConfig>()
    const [error, setError] = useState('')
    const [isLoadingNfts, setIsLoadingNfts] = useState(false)
    const [nfts, setNfts] = useState<Nft[]>([])
    const [mintedNfts, setMintedNfts] = useState<Nft[]>([])
    const [unmintedNfts, setUnmintedNfts] = useState<Nft[]>([])
    const [collectionNft, setCollectionNft] = useState<Nft | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const {
        isUserMinting,
        itemsRemaining,
        mintAccount,
        refreshCandyMachineState,
        isCaptcha,
        setIsCaptcha,
        itemsAvailable,
    } = useMintCandyMachine(candyMachineAccount as string)
    const [hasCollection, setHasCollection] = useState<boolean>(false)
    const [nftsRecoilState, setNftsRecoilState] = useRecoilState(nftsState)
    const [cache, setCache] = useState<File>()
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isVerifyOpen, setIsVerifyOpen] = useState(false)

    const viewNfts = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoadingNfts(true)
        if (!e.target.files || e.target.files.length == 0) {
            window.alert('No files uploaded')
            return
        }
        setCache(e.target.files[0])
        let cacheData = await e.target.files[0].text()
        let cacheDataJson = JSON.parse(cacheData)
        if (!cacheDataJson.items) {
            alert('NFTs Preview not available in cache file')
        } else if (cacheDataJson?.program?.candyMachine === candyMachineAccount) {
            const nfts = Object.values(cacheDataJson?.items)?.map((nft: any) => {
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

    const fetchCandyMachine = async (): Promise<IFetchedCandyMachineConfig | undefined> => {
        if (candyMachineAccount && anchorWallet && connection) {
            setError('')
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
                setError('')
                return state.data
            } catch (err) {
                setError((err as Error).message)
            }
            setIsLoading(false)
        }
    }

    const fetchNfts = async () => {
        setIsLoadingNfts(true)
        try {
            if (!connection) return
            const nfts = await getAllNftsByCM(candyMachineAccount, connection)
            if (nfts.length === 0) return setIsLoadingNfts(false)
            setMintedNfts(nfts)
            setNftsRecoilState(nfts)
            const collectionNftPubkey = (nfts[0]?.collection as ICollectionNft)?.key
            if (!collectionNftPubkey) return
            setHasCollection(true)
            let nftCollectionData = await getNftByMint(collectionNftPubkey, connection)
            if (nftCollectionData?.name !== '') {
                setCollectionNft(nftCollectionData)
            }
        } catch (err) {
            console.error(err)
            setNftsRecoilState([])
        }
        setIsLoadingNfts(false)
    }

    const reloadMintCard = (value: boolean) => setIsCaptcha(value)

    useEffect(() => {
        setError('')
        refreshCandyMachineState()
        setIsLoading(false)
        fetchCandyMachine().then(setCandyMachineConfig)
        fetchNfts()
        setIsLoading(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connection])

    useEffect(() => {
        setUnmintedNfts(nfts?.filter((nft) => !mintedNfts?.includes(nft)))
    }, [nfts, mintedNfts])

    const loadingText = (
        <div className='d-flex flex-items-center'>
            <h3 className='mr-3'>Loading...</h3>
            <Spinner size='small' />
        </div>
    )
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
                        href={`https://solscan.io/account/${candyMachineAccount}${isDevnet}`}
                        sx={{ textDecoration: 'none', color: '#24292F' }}
                    >
                        View in Solscan
                    </Link>
                </Button>
            </div>
            <div className='d-flex flex-justify-center flex-column'>
                <h2 className='my-5 wb-break-all'>[CM]: {candyMachineAccount}</h2>
                {isLoading && loadingText}
                {!isLoading && (
                    <>
                        {error ? (
                            <div className='d-flex flex-column items-center justify-center my-5 col-12 col-md-8 col-lg-6'>
                                <h3 className='color-fg-accent'> Error fetching candy machine config</h3>
                                <Button
                                    className='rounded-lg bg-slate-400 p-2 mt-4'
                                    onClick={() => fetchCandyMachine()}
                                    sx={{ width: 'fit-content' }}
                                >
                                    Fetch again
                                </Button>
                            </div>
                        ) : (
                            candyMachineConfig?.uuid && (
                                <div className='d-flex flex-column'>
                                    <div className='d-flex flex-column mb-6'>
                                        <h3>Configuration</h3>
                                        <div className='border-y width-full my-4' />
                                        <UpdateCandyMachine
                                            fetchedValues={candyMachineConfig}
                                            candyMachinePubkey={candyMachineAccount}
                                            reloadMintCard={reloadMintCard}
                                        />
                                    </div>
                                </div>
                            )
                        )}
                        <div className='d-flex flex-justify-center flex-items-start flex-column mb-10 width-full p-0'>
                            <div className='d-flex flex-justify-between flex-items-center width-full mb-4'>
                                <h3 className='r-0'>NFTs</h3>
                                <div className='l-0 d-flex flex-justify-end flex-items-center'>
                                    <span className='pr-2'>
                                        {isLoadingNfts ? '' : `${mintedNfts?.length}/${itemsAvailable} Minted`}
                                    </span>
                                    <RefreshButton onClick={fetchNfts} isLoading={isLoadingNfts} />
                                </div>
                            </div>
                            <div className='border-y width-full' />
                            <div className='mt-5 mb-7'>
                                {!nfts.length ? (
                                    <>
                                        <h4>NFTs Preview · {itemsRemaining} </h4>
                                        <Text as='p' className='mt-3 mb-4'>
                                            Upload cache file to preview NFTs
                                        </Text>
                                        <Text as='p' className='my-3'>
                                            {cache?.name}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <h4>Unminted NFTs - {itemsAvailable - itemsRemaining} </h4>
                                        <ArrayWrapper array={unmintedNfts} minimum={MINIMUM_NFTS_TO_SHOW}>
                                            <FilterArrayContext.Consumer>
                                                {([unmintedArr]) => (
                                                    <div className='nfts-grid'>
                                                        {unmintedArr.map(({ name, image, mint }) => (
                                                            <NftCard
                                                                title={name}
                                                                imageLink={image}
                                                                key={mint?.toBase58()}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </FilterArrayContext.Consumer>
                                        </ArrayWrapper>
                                        <Text as='p' className='my-3'>
                                            {cache?.name}
                                        </Text>
                                    </>
                                )}
                                <label
                                    htmlFor='nftsCache'
                                    className='px-4 py-2 rounded-2 cursor-pointer color-bg-inset'
                                    style={{ border: '1px solid #1b1f2426' }}
                                >
                                    Upload Cache file
                                </label>
                                <input
                                    id='nftsCache'
                                    type='file'
                                    name='cache'
                                    onChange={viewNfts}
                                    className='w-full p-2 d-none'
                                    required
                                />
                            </div>

                            {isLoadingNfts ? (
                                loadingText
                            ) : (
                                <>
                                    {hasCollection && (
                                        <div className='mb-5'>
                                            <h4>Collection</h4>
                                            <div className='d-flex flex-justify-start flex-items-center gap-5 mt-3'>
                                                <NftCard
                                                    title={collectionNft?.name ?? 'Not available'}
                                                    imageLink={collectionNft?.image ?? '/logo.png'}
                                                    buttons={[
                                                        {
                                                            text: 'View in Solscan',
                                                            as: 'link',
                                                            variant: 'invisible',
                                                            hash: collectionNft?.mint?.toBase58(),
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {error?.includes('Error to fetch data') && (
                                        <Text as='p' className='mt-3 mb-4'>
                                            Error to fetch data. Please, click the refresh button to try again.
                                        </Text>
                                    )}
                                    <div>
                                        <h4>Minted NFTs - {mintedNfts.length} </h4>

                                        <div className='nfts-grid mt-3'>
                                            {itemsRemaining > 0 && isCaptcha && (
                                                <NftCard
                                                    title={'New NFT'}
                                                    buttons={[
                                                        {
                                                            text: 'Captcha enabled',
                                                            as: 'button',
                                                            variant: 'outline',
                                                            disabled: true,
                                                        },
                                                    ]}
                                                />
                                            )}
                                            {itemsRemaining > 0 && !isCaptcha && (
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
                                            <ArrayWrapper
                                                array={mintedNfts}
                                                minimum={
                                                    itemsRemaining > 0 ? MINIMUM_NFTS_TO_SHOW - 1 : MINIMUM_NFTS_TO_SHOW
                                                }
                                            >
                                                <FilterArrayContext.Consumer>
                                                    {([mintedArray]) => (
                                                        <div className='nfts-grid'>
                                                            {mintedArray?.map(({ name, image, mint }) => {
                                                                return (
                                                                    <NftCard
                                                                        title={name}
                                                                        imageLink={image}
                                                                        key={mint?.toBase58()}
                                                                        buttons={[
                                                                            {
                                                                                text: 'View in Solscan',
                                                                                as: 'link',
                                                                                variant: 'invisible',
                                                                                hash: mint?.toBase58(),
                                                                            },
                                                                        ]}
                                                                    />
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </FilterArrayContext.Consumer>
                                            </ArrayWrapper>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}

                {isDeleteOpen && (
                    <Popup onClose={() => setIsDeleteOpen(false)} title='Delete Candy Machine' size='small'>
                        <DeleteCandyMachine candyMachineAccount={candyMachineAccount as string} />
                    </Popup>
                )}
                {isVerifyOpen && (
                    <Popup onClose={() => setIsVerifyOpen(false)} title={`Verify Candy Machine`} size='small'>
                        <VerifyCandyMachine candyMachineAccount={candyMachineAccount as string} />
                    </Popup>
                )}
            </div>
        </>
    )
}

export default CandyMachine
