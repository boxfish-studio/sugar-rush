import { Metaplex } from '@metaplex-foundation/js'
import { Connection, PublicKey } from '@solana/web3.js'
import { Nft } from './interfaces'

export async function getAllNftsByCM(candyMachineAccount: string | string[], connection: Connection): Promise<Nft[]> {
    if (!connection && !candyMachineAccount) return []
    try {
        const metaplex = new Metaplex(connection)
        const nftsAddresses = await metaplex.nfts().findAllByCandyMachine(new PublicKey(candyMachineAccount as string))
        const nfts: Nft[] = []
        for (let i = 0; i < nftsAddresses.length; i++) {
            let nft: Nft
            if (nftsAddresses[i].uri) {
                let fetchData = await fetch(nftsAddresses[i].uri)
                let nftData = await fetchData.json()
                nft = {
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
            } else {
                nft = {
                    name: nftsAddresses[i].name,
                    image: '',
                }
            }
            nfts.push(nft)
        }
        return nfts
    } catch (error) {
        console.log(error)
        throw new Error('Error to fetch data. Reload to try again!')
    }
}
