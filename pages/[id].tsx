import { AnchorProvider, BN, Program } from '@project-serum/anchor'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import {
    Spinner,
    Title,
    UpdateCreateCandyMachineForm,
    Carousel,
    ExplorerLinks,
    NftCard,
    RefreshButton,
} from 'components'
import { CANDY_MACHINE_PROGRAM_V2_ID } from 'lib/candy-machine/constants'
import { IFetchedCandyMachineConfig } from 'lib/candy-machine/interfaces'
import { Account } from 'lib/candy-machine/types'
import { Nft } from 'lib/nft/interfaces'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSetRecoilState } from 'recoil'
import { nftsState } from 'lib/recoil-store/atoms'
import { getAllNftsByCM, getNftByMint } from 'lib/nft/actions'
import { useMintCandyMachine } from 'hooks'

const CandyMachine: NextPage = () => {
    const router = useRouter()
    const candyMachineAccount = router.query.id

    const anchorWallet = useAnchorWallet()
    const { connection } = useConnection()
    const [candyMachineConfig, setCandyMachineConfig] = useState<IFetchedCandyMachineConfig>()
    const [error, setError] = useState('')
    const [nfts, setNfts] = useState<Nft[]>([])
    const [mintedNfts, setMintedNfts] = useState<Nft[]>([])
    const [collectionNft, setCollectionNft] = useState<Nft>()
    const [isLoading, setIsLoading] = useState(false)
    const [isReloading, setIsReloading] = useState(false)
    const setNftsState = useSetRecoilState(nftsState)
    const { isUserMinting, itemsRemaining, mintAccount, refreshCandyMachineState } = useMintCandyMachine(
        candyMachineAccount as string
    )
    const [hasCollection, setHasCollection] = useState(false)

    async function viewNfts(e: React.ChangeEvent<HTMLInputElement>) {
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
    }

    async function getNfts() {
        if (!candyMachineAccount) return
        setIsLoading(true)
        setMintedNfts([])
        let nfts = await getAllNftsByCM(candyMachineAccount, connection)
        setMintedNfts(nfts)
        // @ts-ignore
        if (nfts[0]?.collection?.key) {
            setHasCollection(true)
            // @ts-ignore
            let nftCollectionData = await getNftByMint(nfts[0].collection.key, connection)
            if (nftCollectionData.name !== '') {
                setCollectionNft(nftCollectionData)
            }
        }
        setIsLoading(false)
    }

    async function fetchCandyMachine({
        candyMachineAccount,
        connection,
    }: {
        candyMachineAccount: Account
        connection: Connection
    }): Promise<IFetchedCandyMachineConfig | undefined> {
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

    const refreshNfts = async () => {
        setIsReloading(true)
        try {
            if (candyMachineAccount) {
                const nfts = await getAllNftsByCM(candyMachineAccount, connection)
                setNftsState(nfts)
            } else {
                setNftsState([])
            }
        } catch (e) {
            console.error(e)
        }
        setIsReloading(false)
    }

    useEffect(() => {
        refreshCandyMachineState()
        getNfts()
        fetchCandyMachine({ candyMachineAccount, connection }).then(setCandyMachineConfig)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candyMachineAccount, connection, anchorWallet])

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
                {isLoading && <Spinner />}
                {error && (
                    <div className='d-flex flex-column items-center justify-center mt-11'>
                        Error fetching candy machine config
                        <button
                            className='rounded-lg bg-slate-400 p-2 mt-4'
                            onClick={() => fetchCandyMachine({ candyMachineAccount, connection })}
                        >
                            Fetch again
                        </button>
                    </div>
                )}

                {!error && candyMachineConfig?.uuid && (
                    <div className='mt-5 d-flex flex-column text-center'>
                        <span className='mt-5'>
                            There are{' '}
                            {new BN(candyMachineConfig.itemsAvailable).toNumber() -
                                new BN(candyMachineConfig.itemsRedeemed).toNumber()}{' '}
                            unminted NFT.
                        </span>
                        <span className='mt-2'>
                            {new BN(candyMachineConfig.itemsRedeemed).toNumber()} redeemed NFT.
                        </span>
                        {new BN(candyMachineConfig.itemsAvailable).toNumber() -
                            new BN(candyMachineConfig.itemsRedeemed).toNumber() !==
                            0 && (
                            <>
                                <label
                                    htmlFor='cache'
                                    className='m-8 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-100 transition-all duration-300 ease-linear font-medium border border-gray-500 inline-block cursor-pointer'
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
                )}
                <div className='d-flex flex-justify-center flex-items-start flex-column mb-10 width-full p-0'>
                    <div className='d-flex flex-justify-between flex-items-center width-full mb-5'>
                        <h3 className='r-0'>NFTs</h3>
                        <div className='l-0 d-flex flex-justify-end flex-items-center'>
                            <span className='pr-2'>5/10 Minted</span>
                            <RefreshButton onClick={refreshNfts} isLoading={isReloading} />
                        </div>
                    </div>
                    <div className='border-y width-full' />
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
                        <h4>Minted NFTs - 5</h4>
                        <div className='d-flex flex-justify-start flex-items-center gap-5 mt-3'>
                            {itemsRemaining > 0 && (
                                <NftCard
                                    title={'New NFT'}
                                    buttons={[
                                        {
                                            text: 'Mint 1 NFT',
                                            isLoading: isUserMinting,
                                            as: 'button',
                                            variant: 'primary',
                                            onClick: () => mintAccount(),
                                        },
                                    ]}
                                />
                            )}
                            <NftCard
                                title={'CryptoDude #1'}
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
                            <NftCard
                                title={'CryptoDude #2'}
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
                            <NftCard
                                title={'CryptoDude #3'}
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
                            <NftCard
                                title={'CryptoDude #4'}
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
                            <NftCard
                                title={'CryptoDude #5'}
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
                        </div>
                    </div>
                    <div className='mt-5'>
                        <h4>Unminted NFTs - 10</h4>
                        <div className='d-flex flex-justify-start flex-items-center gap-5 mt-3'>
                            <NftCard
                                title={'CryptoDude #1'}
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
                            <NftCard
                                title={'CryptoDude #2'}
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
                            <NftCard
                                title={'CryptoDude #3'}
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
                            <NftCard
                                title={'CryptoDude #4'}
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
                            <NftCard
                                title={'CryptoDude #5'}
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
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CandyMachine
