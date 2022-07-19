import { Metaplex } from '@metaplex-foundation/js'
import { Connection, PublicKey } from '@solana/web3.js'
import { Nft } from './interfaces'

export async function getAllNftsByCM(candyMachineAccount: string | string[], connection: Connection): Promise<Nft[]> {
    if (!connection && !candyMachineAccount) throw new Error('Connection error')
    try {
        const metaplex = new Metaplex(connection)
        const nftsAddresses = await metaplex.nfts().findAllByCandyMachine(new PublicKey(candyMachineAccount as string))
        const nfts: Nft[] =
            (await Promise.all(
                nftsAddresses?.map(async (nft) => {
                    if (nft.uri) {
                        let fetchData = await fetch(nft.uri)
                        let nftData = await fetchData.json()
                        return {
                            name: nftData.name,
                            image: nftData.image,
                            description: nftData.description,
                            animation_url: nftData.animation_url,
                            external_url: nftData.external_url,
                            symbol: nftData.symbol,
                            mint: nft.mint,
                            collection: nft.collection ?? nftData.collection,
                            attributes: nftData.attributes,
                            properties: nftData.properties,
                            category: nftData.category,
                            creators: nftData.creators,
                            seller_fee_basis_points: nftData.seller_fee_basis_points,
                        }
                    } else {
                        return {
                            name: nft.name,
                            image: '',
                        }
                    }
                })
            )) ?? []
        return nfts
    } catch (error) {
        console.log(error)
        throw new Error('Error to fetch data. Reload to try again!')
    }
}

export async function getNftByMint(mintAccount: PublicKey, connection: Connection): Promise<Nft> {
    let nft: Nft = { name: '', image: '' }
    if (!connection && !mintAccount) return nft
    const metaplex = new Metaplex(connection)
    const nftAddress = await metaplex.nfts().findByMint(mintAccount)

    let fetchData = await fetch(nftAddress?.uri)
    let nftData = await fetchData.json()
    if (nftData) {
        nft = {
            name: nftData.name,
            image: nftData.image,
            description: nftData.description,
            mint: nftAddress.mint,
            animation_url: nftData.animation_url,
            external_url: nftData.external_url,
            symbol: nftData.symbol,
            collection: nftAddress.collection ?? nftData.collection,
            attributes: nftData.attributes,
            properties: nftData.properties,
            category: nftData.category,
            creators: nftData.creators,
            seller_fee_basis_points: nftData.seller_fee_basis_points,
        }
    }
    return nft
}
