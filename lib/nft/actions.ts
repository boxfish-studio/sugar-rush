import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js'
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
            mintAddress: new PublicKey(nftsAddresses[i].mint),
        }
        nfts.push(nft)
    }
    return nfts
}

export async function updateNft(nft: Nft, connection: Connection, wallet: WalletContextState) {
    if (!connection || !wallet) return
    const metaplex = new Metaplex(connection)
    metaplex.use(walletAdapterIdentity(wallet))

    console.log('nft', nft)
    console.log('mintAddres', nft.mintAddress.toBase58())
    const nftData = await metaplex.nfts().findByMint(nft.mintAddress)
    console.log('nftData', nftData)

    const { nft: nftUpdated, transactionId: txId } = await metaplex.nfts().update(nftData, {
        name: 'Test name',
    })

    console.log('nftUpdated', nftUpdated)
    console.log('txId', txId)

    // Data to change
    // UpdateNftInput {
    //     nft: Nft;
    //     name?: string;
    //     symbol?: string;
    //     uri?: string;
    //     sellerFeeBasisPoints?: number;
    //     creators?: Creator[];
    //     collection?: Collection;
    //     uses?: Uses;
    //     newUpdateAuthority?: PublicKey;
    //     primarySaleHappened?: boolean;
    //     isMutable?: boolean;
    //     updateAuthority?: Signer;
    //     confirmOptions?: ConfirmOptions;
    // }
}
