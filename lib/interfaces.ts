import { PublicKey } from '@solana/web3.js'
import { BN, web3, Program } from '@project-serum/anchor'
import { StorageType } from './enums'

export interface WhitelistMintMode {
    neverBurn: undefined | boolean
    burnEveryTime: undefined | boolean
}

export interface FetchedCandyMachineConfig {
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

export interface CandyMachineConfig {
    price: number
    number: number
    gatekeeper: typeof Gatekeeper | null
    solTreasuryAccount: string
    splTokenAccount: null
    splToken: null
    goLiveDate: string
    endSettings: any
    whitelistMintSettings: whitelistMintSettings | null
    hiddenSettings: hiddenSettings | null
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
export const Gatekeeper = {
    gatekeeperNetwork: 'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6',
    expireOnUse: true,
} as const

interface whitelistMintSettings {
    mode: any
    mint: PublicKey
    presale: boolean
    discountPrice: null | BN
}
interface hiddenSettings {
    name: string
    uri: string
    hash: Uint8Array
}

export interface CandyMachineData {
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
        mode: WhitelistMintMode
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

type NumberToString<T extends number | string> = T extends infer T ? (T extends number ? string : T) : never

export interface Cache {
    authority?: string
    program: {
        uuid: string
        candyMachine: string
    }
    items: Record<
        NumberToString<number | string>,
        {
            link: string
            imageLink: string
            name: string
            onChain: boolean
            verifyRun?: boolean
        }
    >

    startDate: BN | null
    env: string
    cacheName: string
}

export type SetupState = {
  mint: web3.Keypair;
  userTokenAccount: web3.PublicKey;
  transaction: string;
};

export interface CandyMachineAccount {
  id: web3.PublicKey;
  program: Program;
  state: CandyMachineState;
}

interface CandyMachineState {
  authority: web3.PublicKey;
  itemsAvailable: number;
  itemsRedeemed: number;
  itemsRemaining: number;
  treasury: web3.PublicKey;
  tokenMint: null | web3.PublicKey;
  isSoldOut: boolean;
  isActive: boolean;
  isPresale: boolean;
  isWhitelistOnly: boolean;
  goLiveDate: BN;
  price: BN;
  gatekeeper: null | {
    expireOnUse: boolean;
    gatekeeperNetwork: web3.PublicKey;
  };
  endSettings: null | {
    number: BN;
    endSettingType: any;
  };
  whitelistMintSettings: whitelistMintSettings
  hiddenSettings: hiddenSettings
  retainAuthority: boolean;
}

export interface CollectionData {
  mint: web3.PublicKey;
  candyMachine: web3.PublicKey;
}