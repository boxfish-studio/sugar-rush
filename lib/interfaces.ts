import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { StorageType } from './enums';

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
