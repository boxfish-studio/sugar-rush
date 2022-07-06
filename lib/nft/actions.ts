import { Metaplex, UpdateNftInput, walletAdapterIdentity } from '@metaplex-foundation/js'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import { Nft } from './interfaces'

export async function getAllNftsByCM(candyMachineAccount: string | string[], connection: Connection): Promise<Nft[]> {
    if (!connection && !candyMachineAccount) return []
    const metaplex = new Metaplex(connection)
    // const nftsAddresses = await metaplex.nfts().findAllByCandyMachine(new PublicKey(candyMachineAccount as string))
    // console.log(nftsAddresses);
    const nftsAddresses = [
        {
            metadataAccount: {
                publicKey: 'J2tNMW7JJXU81B8Uk8MtMRDGHnT9xvW2aBu6z14EyBbU',
                exists: true,
                data: {
                    key: 4,
                    updateAuthority: 'EvajgaETGbFp4QdHmk9Jxcq9VscHPuVuuWjHsAUw6bLs',
                    mint: '4Bpvq3TQWDWWHN9JsXGVWwKYsdhUeqiPRy1Pq2N62rZC',
                    data: {
                        name: 'Test name\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                        symbol: 'BOX\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                        uri: 'https://arweave.net/bBSqDEhx8cSCDGQTHSl33aTbQKVWk6xv0i62Z436Ues\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                        sellerFeeBasisPoints: 500,
                        creators: [
                            {
                                address: 'A5JURZD1KsxHP1V6WMw4gB9PRLRasswoe7kvwRw2zXke',
                                verified: true,
                                share: 0,
                            },
                            {
                                address: 'BoX451MZzydoVdZE4NFfmMT3J5Ztqo7YgUNbwwMfjPFu',
                                verified: false,
                                share: 100,
                            },
                        ],
                    },
                    primarySaleHappened: true,
                    isMutable: true,
                    editionNonce: 255,
                    tokenStandard: 0,
                    collection: null,
                    uses: null,
                    collectionDetails: null,
                },
                executable: false,
                lamports: 5616720,
                owner: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                rentEpoch: 337,
            },
            metadataTask: {
                status: 'pending',
                children: [],
                context: {},
                eventEmitter: {
                    _events: {},
                    _eventsCount: 0,
                },
            },
            editionTask: {
                status: 'pending',
                children: [],
                context: {},
                eventEmitter: {
                    _events: {},
                    _eventsCount: 0,
                },
            },
            updateAuthority: 'EvajgaETGbFp4QdHmk9Jxcq9VscHPuVuuWjHsAUw6bLs',
            mint: '4Bpvq3TQWDWWHN9JsXGVWwKYsdhUeqiPRy1Pq2N62rZC',
            name: 'Test name',
            symbol: 'BOX',
            uri: 'https://arweave.net/bBSqDEhx8cSCDGQTHSl33aTbQKVWk6xv0i62Z436Ues',
            sellerFeeBasisPoints: 500,
            creators: [
                {
                    address: 'A5JURZD1KsxHP1V6WMw4gB9PRLRasswoe7kvwRw2zXke',
                    verified: true,
                    share: 0,
                },
                {
                    address: 'BoX451MZzydoVdZE4NFfmMT3J5Ztqo7YgUNbwwMfjPFu',
                    verified: false,
                    share: 100,
                },
            ],
            primarySaleHappened: true,
            isMutable: true,
            editionNonce: 255,
            tokenStandard: 0,
            collection: null,
            uses: null,
        },
        {
            metadataAccount: {
                publicKey: 'CqHGELa8e5XdNwALQs31YCEPWbTLdCxaNuo7CYnKCi6c',
                exists: true,
                data: {
                    key: 4,
                    updateAuthority: 'EvajgaETGbFp4QdHmk9Jxcq9VscHPuVuuWjHsAUw6bLs',
                    mint: '5vX1VSoCRUHswWiFgh2ktoPjMER3oeBau6S3E19NGbw3',
                    data: {
                        name: 'BOX NFT #0\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                        symbol: 'BOX\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                        uri: 'https://arweave.net/B3rK4dnjASMwJsachkvMrquEvTHlKSy9gMUYSIf8Aqs\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000\u0000',
                        sellerFeeBasisPoints: 500,
                        creators: [
                            {
                                address: 'A5JURZD1KsxHP1V6WMw4gB9PRLRasswoe7kvwRw2zXke',
                                verified: true,
                                share: 0,
                            },
                            {
                                address: 'BoX451MZzydoVdZE4NFfmMT3J5Ztqo7YgUNbwwMfjPFu',
                                verified: false,
                                share: 100,
                            },
                        ],
                    },
                    primarySaleHappened: true,
                    isMutable: true,
                    editionNonce: 248,
                    tokenStandard: 0,
                    collection: null,
                    uses: null,
                    collectionDetails: null,
                },
                executable: false,
                lamports: 5616720,
                owner: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
                rentEpoch: 337,
            },
            metadataTask: {
                status: 'pending',
                children: [],
                context: {},
                eventEmitter: {
                    _events: {},
                    _eventsCount: 0,
                },
            },
            editionTask: {
                status: 'pending',
                children: [],
                context: {},
                eventEmitter: {
                    _events: {},
                    _eventsCount: 0,
                },
            },
            updateAuthority: 'EvajgaETGbFp4QdHmk9Jxcq9VscHPuVuuWjHsAUw6bLs',
            mint: '5vX1VSoCRUHswWiFgh2ktoPjMER3oeBau6S3E19NGbw3',
            name: 'BOX NFT #0',
            symbol: 'BOX',
            uri: 'https://arweave.net/B3rK4dnjASMwJsachkvMrquEvTHlKSy9gMUYSIf8Aqs',
            sellerFeeBasisPoints: 500,
            creators: [
                {
                    address: 'A5JURZD1KsxHP1V6WMw4gB9PRLRasswoe7kvwRw2zXke',
                    verified: true,
                    share: 0,
                },
                {
                    address: 'BoX451MZzydoVdZE4NFfmMT3J5Ztqo7YgUNbwwMfjPFu',
                    verified: false,
                    share: 100,
                },
            ],
            primarySaleHappened: true,
            isMutable: true,
            editionNonce: 248,
            tokenStandard: 0,
            collection: null,
            uses: null,
        },
    ]

    const nfts: Nft[] = []
    for (let i = 0; i < nftsAddresses.length; i++) {
        let fetchData = await fetch(nftsAddresses[i].uri)
        let nftData = await fetchData.json()
        let nft: Nft = {
            name: nftsAddresses[i].name,
            image: nftData.image,
            description: nftData.description,
            animation_url: nftData.animation_url,
            external_url: nftData.external_url,
            symbol: nftsAddresses[i].symbol,
            collection: nftData.collection,
            attributes: nftData.attributes,
            properties: nftData.properties,
            category: nftData.category,
            creators: nftData.creators,
            seller_fee_basis_points: nftData.seller_fee_basis_points,
            mintAddress: new PublicKey(nftsAddresses[i].mint),
        }
        nfts.push(nft)
    }
    return nfts
}

export async function updateNft(nft: Nft, newValues: any, connection: Connection, wallet: WalletContextState) {
    if (!connection || !wallet) return
    const metaplex = new Metaplex(connection)
    metaplex.use(walletAdapterIdentity(wallet))

    console.log('nft', nft)
    console.log('mintAddres', nft.mintAddress?.toBase58())
    if (!nft.mintAddress) return
    const nftData = await metaplex.nfts().findByMint(nft.mintAddress)
    console.log('nftData', nftData)
    console.log('newValues', newValues)

    // console.log(data);
    // const parseDataToUpdateNft: UpdateNftInput = Object.values(JSON.parse(data).items).map((nft: any) => {
    //     return {
    //         name: nft.name,
    //         symbol: nft.symbol,
    //         description: nft.description,
    //         sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
    //     }
    // })

    // const { uri: newUri } = await metaplex.nfts().uploadMetadata({
    //     ...nftData.metadata,
    //     name: 'BOX #5',
    //     description: 'Number 5 of boxfish collection',
    //     symbol: 'BOX5',
    // })

    // const { nft: nftUpdated, transactionId: txId } = await metaplex.nfts().update(nftData, {
    //     uri: newUri,
    //     name: 'BOX #5',
    //     symbol: 'BOX5',
    // })

    // console.log('nftUpdated', nftUpdated)
    // console.log('txId', txId)
}
