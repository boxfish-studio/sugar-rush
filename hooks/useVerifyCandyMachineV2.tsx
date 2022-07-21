import { AnchorProvider, BN, Program } from '@project-serum/anchor'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { ICache, saveCache } from 'lib/cache'
import { CANDY_MACHINE_PROGRAM_V2_ID, CONFIG_ARRAY_START_V2, CONFIG_LINE_SIZE_V2 } from 'lib/candy-machine/constants'
import { Account } from 'lib/candy-machine/types'
import { getTextFromUTF8Array, shardArray } from 'lib/utils'
import { useState } from 'react'
import useRPC from './useRPC'

const useVerifyCandyMachineV2 = (cache: File) => {
    const { connection } = useRPC()
    const anchorWallet = useAnchorWallet()
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    async function verifyCandyMachine({ candyMachineAccount }: { candyMachineAccount: Account }) {
        if (!cache) {
            setError('Upload a cache file.')
            return
        }
        if (candyMachineAccount && anchorWallet && cache) {
            const cacheContent: ICache = JSON.parse(await cache.text())
            if (cacheContent.program?.candyMachine !== candyMachineAccount) {
                setError('Cache file does not match this candy machine.')
                return
            }
            const cacheName = cacheContent.cacheName
            const env = cacheContent.env
            setMessage('')
            setError('')
            let errorMessage = ''
            try {
                const provider = new AnchorProvider(connection, anchorWallet, {
                    preflightCommitment: 'processed',
                })

                const idl = await Program.fetchIdl(CANDY_MACHINE_PROGRAM_V2_ID, provider)

                const program = new Program(idl!, CANDY_MACHINE_PROGRAM_V2_ID, provider)

                const candyMachineInfo = await program.provider.connection.getAccountInfo(
                    new PublicKey(candyMachineAccount)
                )

                const candyMachineObject: any = await program.account.candyMachine.fetch(
                    new PublicKey(candyMachineAccount)
                )

                let isGood = true

                const keys = Object.keys(cacheContent.items)
                    .filter((k) => !cacheContent.items[k].verifyRun)
                    .sort((a, b) => Number(a) - Number(b))

                if (keys.length > 0) {
                    setMessage(`Checking ${keys.length} items that have yet to be checked...`)
                }

                await Promise.all(
                    shardArray(keys, 500).map(async (allIndexesInSlice) => {
                        for (let i = 0; i < allIndexesInSlice.length; i++) {
                            const key = allIndexesInSlice[i]
                            setMessage(`Looking at key ${key}`)
                            const thisSlice = candyMachineInfo!.data.slice(
                                CONFIG_ARRAY_START_V2 + 4 + CONFIG_LINE_SIZE_V2 * (key as unknown as number),
                                CONFIG_ARRAY_START_V2 + 4 + CONFIG_LINE_SIZE_V2 * ((key as unknown as number) + 1)
                            )

                            const name = getTextFromUTF8Array([...thisSlice.slice(4, 36).filter((n) => n !== 0)])
                            const uri = getTextFromUTF8Array([...thisSlice.slice(40, 240).filter((n) => n !== 0)])
                            const cacheItem = cacheContent.items[key]

                            if (name !== cacheItem.name || uri !== cacheItem.link) {
                                ;(errorMessage =
                                    `Name (${name}) or uri (${uri}) didnt match cache values of (${cacheItem.name})` +
                                    `and (${cacheItem.link}). marking to rerun for image ${key}`),
                                    (cacheItem.onChain = false)
                                isGood = false
                            } else {
                                cacheItem.verifyRun = true
                            }
                        }
                    })
                )

                if (!isGood) {
                    throw new Error(`Not all NFTs checked out. Check out logs below for details`)
                }

                const lineCount = new BN(
                    candyMachineInfo!.data.slice(CONFIG_ARRAY_START_V2, CONFIG_ARRAY_START_V2 + 4),
                    undefined,
                    'le'
                )
                setMessage(`Uploaded ${lineCount.toNumber()}/${candyMachineObject.data.itemsAvailable}`)

                if (candyMachineObject.data.itemsAvailable > lineCount.toNumber()) {
                    throw new Error(
                        `predefined number of NFTs (${
                            candyMachineObject.data.itemsAvailable
                        }) is smaller than the uploaded one (${lineCount.toNumber()})`
                    )
                } else {
                    setMessage('All assets are verified. Ready to deploy!')
                }
                saveCache(cacheName, env, cacheContent)
            } catch (err) {
                console.error(err)
                saveCache(cacheName, env, cacheContent)
                setError(errorMessage || (err as Error).message)
            }
        }
    }

    return {
        setError,
        error,
        verifyCandyMachine,
        message,
    }
}

export default useVerifyCandyMachineV2
