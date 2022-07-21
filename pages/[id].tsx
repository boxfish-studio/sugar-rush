import { AnchorProvider, BN, Program } from '@project-serum/anchor'
import { Button, Spinner } from '@primer/react'
import { CANDY_MACHINE_PROGRAM_V2_ID } from 'lib/candy-machine/constants'
import { getAllNftsByCM, getNftByMint } from 'lib/nft/actions'
import { IFetchedCandyMachineConfig } from 'lib/candy-machine/interfaces'
import { Nft } from 'lib/nft/interfaces'
import { nftsState } from 'lib/recoil-store/atoms'
import { Title, NftCard, RefreshButton, ExplorerLinks, UpdateCandyMachine } from 'components'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { useMintCandyMachine, useRPC } from 'hooks'
import { useRecoilState } from 'recoil'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'
import Head from 'next/head'
import type { NextPage } from 'next'

const CandyMachine: NextPage = () => {
    const router = useRouter()
    const candyMachineAccount = router.query.id as string

    const anchorWallet = useAnchorWallet()
    const { connection } = useRPC()
    const [candyMachineConfig, setCandyMachineConfig] = useState<IFetchedCandyMachineConfig>()
    const [error, setError] = useState('')
    const [isLoadingNfts, setIsLoadingNfts] = useState(false)
    const [initialLoad, setInitialLoad] = useState(false)
    const [nfts, setNfts] = useState<Nft[]>([])
    const [mintedNfts, setMintedNfts] = useState<Nft[]>([])
    const [collectionNft, setCollectionNft] = useState<Nft>()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { isUserMinting, itemsRemaining, mintAccount, refreshCandyMachineState, isCaptcha } = useMintCandyMachine(
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

    const fetchCandyMachine = async (): Promise<IFetchedCandyMachineConfig | undefined> => {
        if (candyMachineAccount && anchorWallet) {
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
                setInitialLoad(true)
                setIsLoading(false)

                return state.data
            } catch (err) {
                initialLoad && setError((err as Error).message)
                setIsLoading(false)
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
        fetchCandyMachine().then(setCandyMachineConfig)
        if (initialLoad) {
            setInitialLoad(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connection])

    const loadingText = (
        <div className='d-flex flex-items-center'>
            <h3 className='mr-3'>Loading...</h3>
            <Spinner size='small' />
        </div>
    )

    return (
        <>
            <Head>
                <title>Update Candy Machine</title>
                <meta name='description' content='Generated by create next app' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
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
                                        {isLoadingNfts
                                            ? ''
                                            : `${mintedNfts?.length}/${itemsRemaining + mintedNfts.length} Minted`}
                                    </span>
                                    <RefreshButton onClick={fetchNfts} isLoading={isLoadingNfts} />
                                </div>
                            </div>
                            <div className='border-y width-full' />
                            {isLoadingNfts ? (
                                loadingText
                            ) : (
                                <>
                                    {hasCollection && (
                                        <div className='mt-5'>
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
                                        </div>
                                    )}
                                    <div className='mt-5'>
                                        <h4>Minted NFTs - {mintedNfts.length}</h4>
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
                                            {mintedNfts.map(
                                                ({ name, image, mint }, index) =>
                                                    index < 10 && (
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
                                                    )
                                            )}
                                        </div>
                                    </div>
                                    <div className='mt-5'>
                                        <h4>Unminted NFTs - {itemsRemaining}</h4>
                                        <div className='mt-3 nfts-grid'>
                                            {new Array(5).fill(0).map((_, index) => (
                                                <NftCard
                                                    title={`CryptoDude #${index}`}
                                                    key={index}
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
                    </>
                )}
            </div>
        </>
    )
}

export default CandyMachine
