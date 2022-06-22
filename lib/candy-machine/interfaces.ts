import { BN } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { DEFAULT_GATEKEEPER } from 'lib/candy-machine/constants'
import { StorageType } from 'lib/candy-machine/enums'

interface IWhitelistMintSettings {
    mode: any
    mint: PublicKey
    presale: boolean
    discountPrice: null | BN
}

interface IHiddenSettings {
    name: string
    uri: string
    hash: Uint8Array
}

interface IWhitelistMintMode {
    neverBurn: undefined | boolean
    burnEveryTime: undefined | boolean
}

export interface IFetchedCandyMachineConfig {
    creators: {
        address: PublicKey
        share: 100
        verified: true
    }[]
    endSettings: null
    gatekeeper: null
    goLiveDate: BN
    hiddenSettings: null
    isMutable: true
    itemsAvailable: BN
    maxSupply: BN
    price: BN
    retainAuthority: boolean
    sellerFeeBasisPoints: number
    symbol: string
    uuid: string
    whitelistMintSettings: null
    solTreasuryAccount: PublicKey
    itemsRedeemed: BN
}

export interface ICandyMachineConfig {
    price: number
    number: number
    gatekeeper: typeof DEFAULT_GATEKEEPER | null
    solTreasuryAccount: string
    splTokenAccount: null
    splToken: null
    goLiveDate: string
    endSettings: any
    whitelistMintSettings: IWhitelistMintSettings | null
    hiddenSettings: IHiddenSettings | null
    storage: StorageType
    ipfsInfuraProjectId: null
    ipfsInfuraSecret: null
    nftStorageKey: null
    awsS3Bucket: null
    noRetainAuthority: boolean
    noMutable: boolean
    pinataJwt: null
    pinataGateway: null
    batchSize: null
    uuid: null
    arweaveJwk: null
}

export interface ICandyMachineData {
    itemsAvailable: BN
    uuid: null | string
    symbol: string
    sellerFeeBasisPoints: number
    isMutable: boolean
    maxSupply: BN
    price: BN
    retainAuthority: boolean
    gatekeeper: null | {
        expireOnUse: boolean
        gatekeeperNetwork: PublicKey
    }
    goLiveDate: null | BN
    endSettings: null | [number, BN]
    whitelistMintSettings: null | {
        mode: IWhitelistMintMode
        mint: PublicKey
        presale: boolean
        discountPrice: null | BN
    }
    hiddenSettings: null | {
        name: string
        uri: string
        hash: Uint8Array
    }
    creators: {
        address: PublicKey
        verified: boolean
        share: number
    }[]
}
