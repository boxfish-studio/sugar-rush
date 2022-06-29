import { Metaplex } from '@metaplex-foundation/js'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Nft } from './interfaces'

export async function getAllNftsByCM(candyMachineAccount: string | string[]) {
    const { connection } = useConnection()

    const metaplex = new Metaplex(connection)
    const nftsAddresses = await metaplex.nfts().findAllByCandyMachine(new PublicKey(candyMachineAccount))

    const nfts: Nft[] = []
    for (let i = 0; i < nfts.length; i++) {
        let fetchData = await fetch(nftsAddresses[i].uri)
        let nftData = await fetchData.json()
        let nft: Nft = {
            name: nfts[i].name,
            imageLink: nftData.image,
        }
        nfts.push(nft)
    }
    return nfts
}
