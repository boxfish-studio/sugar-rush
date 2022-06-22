import { PublicKey } from '@solana/web3.js'
import { Program } from '@project-serum/anchor'
import { saveCache } from '../cache'
import { Cache } from 'lib/interfaces'

export async function updateV2({
    newSettings,
    candyMachinePubkey,
    publicKey,
    treasuryWallet,
    anchorProgram,
    cache,
    newAuthority,
}: {
    newSettings: any
    candyMachinePubkey: string | string[]
    publicKey: PublicKey
    treasuryWallet: PublicKey
    anchorProgram: Program
    cache: string
    newAuthority: string
}) {
    try {
        const cacheContent: Cache = JSON.parse(cache)
        const env = cacheContent.env
        const cacheName = cacheContent.cacheName

        const tx = await anchorProgram.methods
            .updateCandyMachine(newSettings)
            .accounts({
                candyMachine: new PublicKey(candyMachinePubkey),
                authority: publicKey,
                wallet: treasuryWallet,
            })
            .signers([])
            .rpc()

        cacheContent.startDate = newSettings.goLiveDate

        console.log('update_candy_machine finished', tx)

        if (newAuthority) {
            const tx = await anchorProgram.methods
                .updateAuthority(new PublicKey(newAuthority))
                .accounts({
                    candyMachine: new PublicKey(candyMachinePubkey),
                    authority: publicKey,
                    wallet: treasuryWallet,
                })
                .rpc()

            cacheContent.authority = new PublicKey(newAuthority).toBase58()
            console.log(` - updated authority: ${cacheContent.authority}`)
            console.log('update_authority finished', tx)
        }

        saveCache(cacheName, env, cacheContent)
    } catch (err) {
        console.error(err)
    }
}
