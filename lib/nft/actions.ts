import { Metaplex } from '@metaplex-foundation/js'
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
            name: nftData.name,
            image: nftData.image,
            description: nftData.description,
            animation_url: nftData.animation_url,
            external_url: nftData.external_url,
            symbol: nftData.symbol,
            collection: nftData.collection,
            attributes: nftData.attributes,
            properties: nftData.properties,
            category: nftData.category,
            creators: nftData.creators,
            seller_fee_basis_points: nftData.seller_fee_basis_points,
        }
        nfts.push(nft)
    }
    return nfts
}

export async function getNftByMint(mintAccount: string | string[], connection: Connection): Promise<Nft> {
    let nft: Nft = { name: '', image: '' }
    if (!connection && !mintAccount) return nft
    const metaplex = new Metaplex(connection)
    const nftAddress = await metaplex.nfts().findByMint(new PublicKey(mintAccount as string))
    let fetchData = await fetch(nftAddress?.uri)
    let nftData = await fetchData.json()
    if (nftData) {
        nft = {
            name: nftData.name,
            image: nftData.image,
        }
    }
    return nft
}
