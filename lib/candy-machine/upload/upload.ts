import { BN, Program, web3 } from '@project-serum/anchor'
import { AnchorWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { PromisePool } from '@supercharge/promise-pool'
import { ICache, saveCache } from 'lib/cache'
import { StorageType } from 'lib/candy-machine/enums'
// import {
//   makeArweaveBundleUploadGenerator,
//   withdrawBundlr,
// } from '../helpers/upload/arweave-bundle';
// import { awsUpload } from '../helpers/upload/aws';
// import { ipfsCreds, ipfsUpload } from '../helpers/upload/ipfs';
import { Manifest } from 'lib/types'
import { arweaveUpload } from './arweave'
import { createCandyMachineV2, getFileExtension, getFileName, sleep } from './helpers'

// import { nftStorageUpload } from '../helpers/upload/nft-storage';
// import { pinataUpload } from '../helpers/upload/pinata';
// import { setCollection } from './set-collection';

type AssetKey = { mediaExt: string; index: string }

export async function uploadV2({
    files,
    cacheName,
    env,
    totalNFTs,
    storage,
    retainAuthority,
    mutable,
    // nftStorageKey,
    // ipfsCredentials,
    // pinataJwt,
    // pinataGateway,
    // awsS3Bucket,
    batchSize,
    price,
    treasuryWallet,
    // splToken,
    gatekeeper,
    goLiveDate,
    endSettings,
    whitelistMintSettings,
    hiddenSettings,
    // uuid,
    walletKeyPair,
    anchorProgram,
    rateLimit,
}: // arweaveJwk,
// collectionMintPubkey,
// rpcUrl,
// setCollectionMint,

{
    files: File[]
    cacheName: string
    env: 'mainnet-beta' | 'devnet'
    totalNFTs: number
    storage: string
    retainAuthority: boolean
    mutable: boolean
    // nftStorageKey: string;
    // ipfsCredentials: ipfsCreds;
    // pinataJwt: string;
    // pinataGateway: string;
    // awsS3Bucket: string;
    batchSize: number | null
    price: BN
    treasuryWallet: PublicKey
    // splToken: PublicKey;
    gatekeeper: null | {
        expireOnUse: boolean
        gatekeeperNetwork: web3.PublicKey
    }
    goLiveDate: null | BN
    endSettings: null | [number, BN]
    whitelistMintSettings: null | {
        mode: any
        mint: PublicKey
        presale: boolean
        discountPrice: null | BN
    }
    hiddenSettings: null | {
        name: string
        uri: string
        hash: Uint8Array
    }
    // uuid: string;
    walletKeyPair: AnchorWallet
    anchorProgram: Program
    // arweaveJwk: string;
    rateLimit: number | null
    // collectionMintPubkey: null | PublicKey;
    // setCollectionMint: boolean;
    // rpcUrl: null | string;
}): Promise<boolean | string> {
    // const savedContent = loadCache(cacheName, env);
    let cacheContent: Partial<ICache> = {
        program: {
            uuid: '',
            candyMachine: '',
        },
        items: {},
    }
    const filesNames = files.map((file) => file.name)

    // if (!cacheContent.program) {
    //   cacheContent.program = {};
    // }

    // if (!cacheContent.items) {
    //   cacheContent.items = {};
    // }

    const dedupedAssetKeys = getAssetKeysNeedingUpload(cacheContent.items as ICache['items'], filesNames)
    console.log('dedupedAssetKeys', dedupedAssetKeys)

    let candyMachine =
        // cacheContent.program.candyMachine
        //   ? new PublicKey(cacheContent.program.candyMachine)
        //   :
        undefined

    if (!cacheContent?.program?.uuid) {
        const firstManifestFile = files.find((file) => file.name === '0.json')
        if (!firstManifestFile) throw new Error('0.json must be present')
        const firstAssetManifest = JSON.parse(await firstManifestFile.text()) as unknown as Manifest

        try {
            // TODO - SPL TOKEN PAYMENT

            if (!firstAssetManifest.properties?.creators?.every((creator) => creator.address !== undefined)) {
                throw new Error('Creator address is missing')
            }

            // initialize candy
            console.info(`initializing candy machine`)
            const res = await createCandyMachineV2(
                anchorProgram,
                walletKeyPair,
                treasuryWallet,
                // splToken,
                {
                    itemsAvailable: new BN(totalNFTs),
                    uuid: null,
                    symbol: firstAssetManifest.symbol,
                    sellerFeeBasisPoints: firstAssetManifest.seller_fee_basis_points,
                    isMutable: mutable,
                    maxSupply: new BN(0),
                    retainAuthority: retainAuthority,
                    gatekeeper,
                    goLiveDate,
                    price,
                    endSettings,
                    whitelistMintSettings,
                    hiddenSettings,
                    creators: firstAssetManifest.properties.creators.map((creator) => {
                        return {
                            address: new PublicKey(creator.address),
                            verified: true,
                            share: creator.share,
                        }
                    }),
                }
            )
            console.log('res', res)
            cacheContent.program!.uuid = res.uuid
            cacheContent.program!.candyMachine = res.candyMachine.toBase58()
            cacheContent.startDate = goLiveDate

            candyMachine = res.candyMachine

            // TODO - set collection mint

            console.info(`initialized config for a candy machine with publickey: ${res.candyMachine.toBase58()}`)

            // saveCache(cacheName, env, cacheContent);
        } catch (exx) {
            console.error('Error deploying config to Solana network.', exx)
            throw exx
        }
    } else {
        console.info(
            `config for a candy machine with publickey: ${cacheContent?.program.candyMachine} has been already initialized`
        )
    }

    // TODO CHANGE ANY
    const uploadedItems = Object.values(cacheContent.items!).filter((f: any) => !!f.link).length

    console.info(`[${uploadedItems}] out of [${totalNFTs}] items have been uploaded`)

    if (dedupedAssetKeys.length) {
        console.info(
            `Starting upload for [${dedupedAssetKeys.length}] items, format ${JSON.stringify(dedupedAssetKeys[0])}`
        )
    }

    if (dedupedAssetKeys.length) {
        // TODO - progress bar

        // TODO make single promise not overlap each other
        await PromisePool.withConcurrency(batchSize || 1)
            .for(dedupedAssetKeys)
            .handleError(async (err, asset) => {
                console.error(`\nError uploading ${JSON.stringify(asset)} asset (skipping)`, err.message)
                await sleep(5000)
            })

            .process(async (asset) => {
                console.log('processing asset: ', asset)
                const jsonFile = files.find(
                    (file) => getFileName(file.name) === asset.index && file.type === 'application/json'
                )
                const imageFile = files.find(
                    (file) => getFileName(file.name) === asset.index && file.type.startsWith('image/')
                )
                if (!jsonFile) {
                    throw new Error(`JSON file ${asset.index}.json is missing`)
                }
                const manifest = getAssetManifest(
                    asset.index,
                    JSON.parse(await jsonFile?.text()) as unknown as Manifest
                )

                // TODO - ADD ANIMATIONS

                const manifestBuffer = Buffer.from(JSON.stringify(manifest))
                if (!imageFile) throw new Error(`Image file ${asset.index} is missing`)
                let link, imageLink, animationLink
                try {
                    switch (storage) {
                        case StorageType.Arweave:
                        default:
                            ;[link, imageLink] = await arweaveUpload(
                                walletKeyPair,
                                anchorProgram,
                                env,
                                imageFile,
                                manifestBuffer,
                                manifest,
                                Number(asset.index)
                            )

                            if (link && imageLink) {
                                cacheContent.items![asset.index] = {
                                    link,
                                    imageLink,
                                    name: manifest.name,
                                    onChain: false,
                                }
                            }
                    }
                } catch (err) {
                    saveCache(cacheName, env, cacheContent as ICache)
                    console.error(err)
                }
            })
    }

    let uploadSuccessful = true
    try {
        if (!hiddenSettings && candyMachine) {
            uploadSuccessful = await writeIndices({
                anchorProgram,
                cacheContent,
                cacheName,
                env,
                candyMachine,
                walletKeyPair,
                rateLimit,
            })
            console.log('cache content: ', cacheContent)
            const uploadedItems = Object.values(cacheContent.items!).filter((f: any) => !!f.link).length
            console.log('uploadedItems: ', uploadedItems)
            console.log('totalNFTs: ', totalNFTs)
            console.log('uploadSuccessful: ', uploadSuccessful)

            uploadSuccessful = uploadSuccessful && uploadedItems == totalNFTs
        } else {
            console.log('Skipping upload to chain as this is a hidden Candy Machine')
        }

        console.log(`Done. Successful = ${uploadSuccessful}.`)
        return cacheContent.program!.candyMachine
    } catch (err) {
        console.error(err)
        return false
    }
}

/**
 * From the Cache object & a list of file paths, return a list of asset keys
 * (filenames without extension nor path) that should be uploaded, sorted numerically in ascending order.
 * Assets which should be uploaded either are not present in the Cache object,
 * or do not truthy value for the `link` property.
 */
function getAssetKeysNeedingUpload(items: ICache['items'], files: string[]): AssetKey[] {
    const all = [...new Set([...Object.keys(items), ...files])]
    const keyMap: any = {}
    const assets = all
        .filter((k) => !k.includes('.json'))
        .reduce((acc: AssetKey[], assetKey) => {
            const key = getFileName(assetKey)
            const ext = getFileExtension(assetKey)

            if (!items[key]?.link && !keyMap[key]) {
                keyMap[key] = true
                acc.push({ mediaExt: ext, index: key })
            }
            return acc
        }, [])
        .sort((a, b) => Number.parseInt(a.index, 10) - Number.parseInt(b.index, 10))
    console.log(assets)
    return assets
}

/**
 * Returns a Manifest from a path and an assetKey
 * Replaces image.ext => index.ext
 * Replaces animation_url.ext => index.ext
 */
export function getAssetManifest(assetIndex: string, manifest: Manifest): Manifest {
    manifest.image = manifest.image.replace('image', assetIndex)

    if ('animation_url' in manifest) {
        manifest.animation_url = manifest.animation_url.replace('animation_url', assetIndex)
    }
    return manifest
}

/**
 * For each asset present in the Cache object, write to the deployed
 * configuration an additional line with the name of the asset and the link
 * to its manifest, if the asset was not already written according to the
 * value of `onChain` property in the Cache object, for said asset.
 */
async function writeIndices({
    anchorProgram,
    cacheContent,
    cacheName,
    env,
    candyMachine,
    walletKeyPair,
    rateLimit,
}: {
    anchorProgram: Program
    cacheContent: any
    cacheName: string
    env: string
    candyMachine: PublicKey
    walletKeyPair: AnchorWallet
    rateLimit: number | null
}) {
    let uploadSuccessful = true
    const keys = Object.keys(cacheContent.items)
    const poolArray = []
    const allIndicesInSlice = Array.from(Array(keys.length).keys())
    let offset = 0
    while (offset < allIndicesInSlice.length) {
        let length = 0
        let lineSize = 0
        let configLines = allIndicesInSlice.slice(offset, offset + 16)
        while (length < 850 && lineSize < 16 && configLines[lineSize] !== undefined) {
            length +=
                cacheContent.items[keys[configLines[lineSize]]].link.length +
                cacheContent.items[keys[configLines[lineSize]]].name.length
            if (length < 850) lineSize++
        }
        configLines = allIndicesInSlice.slice(offset, offset + lineSize)
        offset += lineSize
        const onChain = configLines.filter((i) => cacheContent.items[keys[i]]?.onChain || false)
        const index = keys[configLines[0]]
        if (onChain.length != configLines.length) {
            poolArray.push({ index, configLines })
        }
    }
    console.info(`Writing all indices in ${poolArray.length} transactions...`)

    // TODO - progress bar
    const addConfigLines = async ({ index, configLines }: { index: any; configLines: any[] }) => {
        const response = await anchorProgram.methods
            .addConfigLines(
                index,
                configLines.map((i) => ({
                    uri: cacheContent.items[keys[i]].link,
                    name: cacheContent.items[keys[i]].name,
                }))
            )
            .accounts({
                candyMachine,
                authority: walletKeyPair.publicKey,
            })
            .signers([])
            .rpc()
        console.log(response)
        configLines.forEach((i) => {
            cacheContent.items[keys[i]] = {
                ...cacheContent.items[keys[i]],
                onChain: true,
                verifyRun: false,
            }
        })
        // saveCache(cacheName, env, cacheContent);

        // progressBar.increment();
    }

    await PromisePool.withConcurrency(rateLimit || 5)
        .for(poolArray)
        .handleError(async (err, { index, configLines }) => {
            console.error(
                `\nFailed writing indices ${index}-${keys[configLines[configLines.length - 1]]}: ${err.message}`
            )
            await sleep(5000)
            uploadSuccessful = false
        })
        .process(async ({ index, configLines }) => {
            await addConfigLines({ index, configLines })
        })
    // progressBar.stop();
    saveCache(cacheName, env, cacheContent)
    return uploadSuccessful
}
