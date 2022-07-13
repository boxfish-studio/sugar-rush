import { Metaplex, UpdateNftInput, walletAdapterIdentity } from '@metaplex-foundation/js'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import { Nft } from './interfaces'

export async function getAllNftsByCM(candyMachineAccount: string | string[], connection: Connection): Promise<Nft[]> {
    if (!connection && !candyMachineAccount) return []
    const metaplex = new Metaplex(connection)
    const nftsAddresses = await metaplex.nfts().findAllByCandyMachine(new PublicKey(candyMachineAccount as string))

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

export async function updateNft(
    nftMintAddress: PublicKey,
    newValues: any,
    connection: Connection,
    wallet: WalletContextState
): Promise<string> {
    if (!connection || !wallet) return 'NFT mint address not provided'
    const metaplex = new Metaplex(connection)
    metaplex.use(walletAdapterIdentity(wallet))

    if (!nftMintAddress) return 'NFT mint address not provided'
    const nftData = await metaplex.nfts().findByMint(nftMintAddress)

    const { nft: nftUpdated, transactionId: txId } = await metaplex
        .nfts()
        .update(nftData, Object.fromEntries(newValues))
    console.log('nftUpdated', nftUpdated)
    return txId

    // TODO: To update all the data, it has to update the metadata like this
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
}
