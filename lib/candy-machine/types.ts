import { PublicKey } from '@solana/web3.js';
import {BN} from '@project-serum/anchor';

export interface WhitelistMintMode {
  neverBurn: undefined | boolean;
  burnEveryTime: undefined | boolean;
}

export interface FetchedCandyMachineConfig {
  creators: {
    address: PublicKey;
    share: 100;
    verified: true;
  }[];
  endSettings: null;
  gatekeeper: null;
  goLiveDate: BN;
  hiddenSettings: null;
  isMutable: true;
  itemsAvailable: BN;
  maxSupply: BN;
  price: BN;
  retainAuthority: boolean;
  sellerFeeBasisPoints: number;
  symbol: string;
  uuid: string;
  whitelistMintSettings: null;
  solTreasuryAccount: PublicKey;
  itemsRedeemed: BN;
}

export interface CandyMachineConfig {
  price: number;
  number: number;
  gatekeeper: typeof Gatekeeper | null;
  solTreasuryAccount: string;
  splTokenAccount: null;
  splToken: null;
  goLiveDate: string;
  endSettings: any;
  whitelistMintSettings: whitelistMintSettings | null;
  hiddenSettings: hiddenSettings | null;
  storage: StorageType;
  ipfsInfuraProjectId: null;
  ipfsInfuraSecret: null;
  nftStorageKey: null;
  awsS3Bucket: null;
  noRetainAuthority: boolean;
  noMutable: boolean;
  pinataJwt: null;
  pinataGateway: null;
  batchSize: null;
  uuid: null;
  arweaveJwk: null;
}
export const Gatekeeper = {
  gatekeeperNetwork: 'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6',
  expireOnUse: true,
} as const;

interface whitelistMintSettings {
  mode: any;
  mint: PublicKey;
  presale: boolean;
  discountPrice: null | BN;
}
interface hiddenSettings {
  name: string;
  uri: string;
  hash: Uint8Array;
}

export enum StorageType {
  ArweaveBundle = 'arweave-bundle',
  ArweaveSol = 'arweave-sol',
  Arweave = 'arweave',
  Ipfs = 'ipfs',
  Aws = 'aws',
  NftStorage = 'nft-storage',
  Pinata = 'pinata',
}

/**
 * The Manifest object for a given asset.
 * This object holds the contents of the asset's JSON file.
 * Represented here in its minimal form.
 */
export type Manifest = {
  image: string;
  animation_url: string;
  name: string;
  symbol: string;
  seller_fee_basis_points: number;
  properties: {
    files: Array<{ type: string; uri: string }>;
    creators: Array<{
      address: string;
      share: number;
    }>;
  };
};


export interface CandyMachineData {
  itemsAvailable: BN;
  uuid: null | string;
  symbol: string;
  sellerFeeBasisPoints: number;
  isMutable: boolean;
  maxSupply: BN;
  price: BN;
  retainAuthority: boolean;
  gatekeeper: null | {
    expireOnUse: boolean;
    gatekeeperNetwork: PublicKey;
  };
  goLiveDate: null | BN;
  endSettings: null | [number, BN];
  whitelistMintSettings: null | {
    mode: WhitelistMintMode;
    mint: PublicKey;
    presale: boolean;
    discountPrice: null | BN;
  };
  hiddenSettings: null | {
    name: string;
    uri: string;
    hash: Uint8Array;
  };
  creators: {
    address: PublicKey;
    verified: boolean;
    share: number;
  }[];
}
