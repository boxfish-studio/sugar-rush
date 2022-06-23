import { PublicKey } from '@solana/web3.js'

export const CANDY_MACHINE_PROGRAM_V2_ID = new PublicKey('cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ')
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

export const ARWEAVE_PAYMENT_WALLET = new PublicKey('6FKvsq4ydWFci6nGq9ckbjYMtnmaqAoatz5c9XWjiDuS')
export const ARWEAVE_UPLOAD_ENDPOINT = 'https://us-central1-metaplex-studios.cloudfunctions.net/uploadFile'

const MAX_NAME_LENGTH = 32
const MAX_URI_LENGTH = 200
const MAX_SYMBOL_LENGTH = 10
const MAX_CREATOR_LEN = 32 + 1 + 1
const MAX_CREATOR_LIMIT = 5

export const CONFIG_ARRAY_START_V2 =
    8 + // key
    32 + // authority
    32 + //wallet
    33 + // token mint
    4 +
    6 + // uuid
    8 + // price
    8 + // items available
    9 + // go live
    10 + // end settings
    4 +
    MAX_SYMBOL_LENGTH + // u32 len + symbol
    2 + // seller fee basis points
    4 +
    MAX_CREATOR_LIMIT * MAX_CREATOR_LEN + // optional + u32 len + actual vec
    8 + //max supply
    1 + // is mutable
    1 + // retain authority
    1 + // option for hidden setting
    4 +
    MAX_NAME_LENGTH + // name length,
    4 +
    MAX_URI_LENGTH + // uri length,
    32 + // hash
    4 + // max number of lines;
    8 + // items redeemed
    1 + // whitelist option
    1 + // whitelist mint mode
    1 + // allow presale
    9 + // discount price
    32 + // mint key for whitelist
    1 +
    32 +
    1 // gatekeeper

export const CONFIG_LINE_SIZE_V2 = 4 + 32 + 4 + 200

export const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/gif', 'image/jpeg']
export const SUPPORTED_ANIMATION_TYPES = [
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/x-flac',
    'audio/wav',
    'model/gltf-binary',
    'text/html',
]

export const DEFAULT_GATEKEEPER = {
    gatekeeperNetwork: 'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6',
    expireOnUse: true,
}
