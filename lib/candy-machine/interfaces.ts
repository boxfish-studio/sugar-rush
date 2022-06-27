import { BN, web3, Program } from '@project-serum/anchor'
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

export type SetupState = {
    mint: web3.Keypair
    userTokenAccount: web3.PublicKey
    transaction: string
}
export interface CandyMachineAccount {
    id: web3.PublicKey
    program: Program
    state: CandyMachineState
}

interface CandyMachineState {
    authority: web3.PublicKey
    itemsAvailable: number
    itemsRedeemed: number
    itemsRemaining: number
    treasury: web3.PublicKey
    tokenMint: null | web3.PublicKey
    isSoldOut: boolean
    isActive: boolean
    isPresale: boolean
    isWhitelistOnly: boolean
    goLiveDate: BN
    price: BN
    gatekeeper: null | {
        expireOnUse: boolean
        gatekeeperNetwork: web3.PublicKey
    }
    endSettings: null | {
        number: BN
        endSettingType: any
    }
    whitelistMintSettings: IWhitelistMintSettings
    hiddenSettings: IHiddenSettings
    retainAuthority: boolean
}

export interface CollectionData {
    mint: web3.PublicKey
    candyMachine: web3.PublicKey
}
