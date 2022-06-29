import { Metaplex } from '@metaplex-foundation/js'
import { Connection, PublicKey } from '@solana/web3.js'
import { Nft } from './interfaces'

export async function getAllNftsByCM(candyMachineAccount: string | string[], connection: Connection) {
    const metaplex = new Metaplex(connection)
    const nftsAddresses = await metaplex.nfts().findAllByCandyMachine(new PublicKey(candyMachineAccount))

    const nfts: Nft[] = []
    for (let i = 0; i < nftsAddresses.length; i++) {
        let fetchData = await fetch(nftsAddresses[i].uri)
        let nftData = await fetchData.json()
        let nft: Nft = {
            name: nftData.name,
            imageLink: nftData.image,
        }
        nfts.push(nft)
    }
    return nfts
}
