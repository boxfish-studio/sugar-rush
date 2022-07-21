import { AnchorProvider, BN, Program } from '@project-serum/anchor'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import { Title, UpdateCandyMachine, Carousel, NftCard, RefreshButton } from 'components'
import { CANDY_MACHINE_PROGRAM_V2_ID } from 'lib/candy-machine/constants'
import { IFetchedCandyMachineConfig } from 'lib/candy-machine/interfaces'
import { Nft } from 'lib/nft/interfaces'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSetRecoilState } from 'recoil'
import { nftsState } from 'lib/recoil-store/atoms'
import { getAllNftsByCM, getNftByMint } from 'lib/nft/actions'
import { Button, Spinner } from '@primer/react'
import { useMintCandyMachine, useRPC } from 'hooks'

const CandyMachine: NextPage = () => {
    const router = useRouter()
    const candyMachineAccount = router.query.id

    const anchorWallet = useAnchorWallet()
    const { connection } = useRPC()
    const [candyMachineConfig, setCandyMachineConfig] = useState<IFetchedCandyMachineConfig>()
    const [error, setError] = useState('')
    const [initialLoad, setInitialLoad] = useState(false)
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

    async function fetchCandyMachine(): Promise<IFetchedCandyMachineConfig | undefined> {
        setError('')
        if (candyMachineAccount && anchorWallet) {
            try {
                console.log(4, error)

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
        ;(async function () {
            setError('')
            fetchCandyMachine().then(setCandyMachineConfig)
            await getNfts()
        })()
        if (initialLoad) {
            setInitialLoad(false)
        }
    }, [connection])

    if (!initialLoad && error.includes('Account does not exist')) {
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
            <div className='d-flex flex-justify-center flex-column'>
                <h2 className='my-5 wb-break-all'>[CM]: {candyMachineAccount}</h2>
                {isLoading && (
                    <div className='d-flex flex-items-center'>
                        <h3 className='mr-3'>Loading...</h3>
                        <Spinner size='small' />
                    </div>
                )}
                {error && (
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
                )}

                {!error && !isLoading && candyMachineConfig?.uuid && (
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
                )}

                {!isLoading && (
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
                )}
            </div>
        </>
    )
}

export default CandyMachine
