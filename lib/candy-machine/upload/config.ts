import * as anchor from "@project-serum/anchor";
import { CANDY_MACHINE_PROGRAM_V2_ID } from "../constants";

import { PublicKey, Keypair } from "@solana/web3.js";

import { getMint, TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";

export interface WhitelistMintMode {
  neverBurn: undefined | boolean;
  burnEveryTime: undefined | boolean;
}

import { getAtaForMint,parseDate } from "./helpers";

export interface CandyMachineData {
  itemsAvailable: anchor.BN;
  uuid: null | string;
  symbol: string;
  sellerFeeBasisPoints: number;
  isMutable: boolean;
  maxSupply: anchor.BN;
  price: anchor.BN;
  retainAuthority: boolean;
  gatekeeper: null | {
    expireOnUse: boolean;
    gatekeeperNetwork: PublicKey;
  };
  goLiveDate: null | anchor.BN;
  endSettings: null | [number, anchor.BN];
  whitelistMintSettings: null | {
    mode: WhitelistMintMode;
    mint: anchor.web3.PublicKey;
    presale: boolean;
    discountPrice: null | anchor.BN;
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

export enum StorageType {
  ArweaveBundle = "arweave-bundle",
  ArweaveSol = "arweave-sol",
  Arweave = "arweave",
  Ipfs = "ipfs",
  Aws = "aws",
  NftStorage = "nft-storage",
  Pinata = "pinata",
}

export async function loadCandyProgramV2(customRpcUrl?: string) {
  if (customRpcUrl) console.log("USING CUSTOM URL", customRpcUrl);

  const provider = anchor.getProvider();
  const idl = (await anchor.Program.fetchIdl(
    CANDY_MACHINE_PROGRAM_V2_ID,
    provider
  )) as anchor.Idl;

  const program = new anchor.Program(
    idl,
    CANDY_MACHINE_PROGRAM_V2_ID,
    provider
  );
  console.log("program id from anchor", program.programId.toBase58());
  return program;
}

export async function getCandyMachineV2Config(
  walletKeyPair: Keypair,
  configForm?: any
): Promise<{
  storage: StorageType;
  nftStorageKey: string;
  ipfsInfuraProjectId: string;
  number: number;
  ipfsInfuraSecret: string;
  pinataJwt: string;
  pinataGateway: string;
  awsS3Bucket: string;
  retainAuthority: boolean;
  mutable: boolean;
  batchSize: number;
  price: anchor.BN;
  treasuryWallet: PublicKey;
  splToken: PublicKey | null;
  gatekeeper: null | {
    expireOnUse: boolean;
    gatekeeperNetwork: PublicKey;
  };
  endSettings: null | [number, anchor.BN];
  whitelistMintSettings: null | {
    mode: any;
    mint: PublicKey;
    presale: boolean;
    discountPrice: null | anchor.BN;
  };
  hiddenSettings: null | {
    name: string;
    uri: string;
    hash: Uint8Array;
  };
  goLiveDate: anchor.BN | null;
  uuid: string;
  arweaveJwk: string;
}> {
  if (configForm === undefined) {
    throw new Error("The configForm is undefined");
  }

  const configString = fs.readFileSync(configForm);

  //@ts-ignore
  const config = JSON.parse(configString);

  const {
    storage,
    nftStorageKey,
    ipfsInfuraProjectId,
    number,
    ipfsInfuraSecret,
    pinataJwt,
    pinataGateway,
    awsS3Bucket,
    noRetainAuthority,
    noMutable,
    batchSize,
    price,
    splToken,
    splTokenAccount,
    solTreasuryAccount,
    gatekeeper,
    endSettings,
    hiddenSettings,
    whitelistMintSettings,
    goLiveDate,
    uuid,
    arweaveJwk,
  } = config;

  let wallet;
  let parsedPrice = price;

  const splTokenAccountFigured = splTokenAccount
    ? splTokenAccount
    : splToken
    ? (await getAtaForMint(new PublicKey(splToken), walletKeyPair.publicKey))[0]
    : null;
  if (splToken) {
    if (solTreasuryAccount) {
      throw new Error(
        "If spl-token-account or spl-token is set then sol-treasury-account cannot be set"
      );
    }
    if (!splToken) {
      throw new Error(
        "If spl-token-account is set, spl-token must also be set"
      );
    }
    const splTokenKey = new PublicKey(splToken);
    const splTokenAccountKey = new PublicKey(splTokenAccountFigured);
    if (!splTokenAccountFigured) {
      throw new Error(
        "If spl-token is set, spl-token-account must also be set"
      );
    }

    const anchorProgram = await loadCandyProgramV2();

    const mintInfo = await getMint(
      anchorProgram.provider.connection,
      splTokenKey,
      undefined,
      TOKEN_PROGRAM_ID
    );
    if (!mintInfo.isInitialized) {
      throw new Error(`The specified spl-token is not initialized`);
    }
    const tokenAccount = await getAccount(
      anchorProgram.provider.connection,
      splTokenAccountKey,
      undefined,
      TOKEN_PROGRAM_ID
    );
    if (!tokenAccount.isInitialized) {
      throw new Error(`The specified spl-token-account is not initialized`);
    }
    if (!tokenAccount.mint.equals(splTokenKey)) {
      throw new Error(
        `The spl-token-account's mint (${tokenAccount.mint.toString()}) does not match specified spl-token ${splTokenKey.toString()}`
      );
    }

    wallet = new PublicKey(splTokenAccountKey);
    parsedPrice = price * 10 ** mintInfo.decimals;
    if (
      whitelistMintSettings?.discountPrice ||
      whitelistMintSettings?.discountPrice === 0
    ) {
      whitelistMintSettings.discountPrice *= 10 ** mintInfo.decimals;
    }
  } else {
    parsedPrice = price * 10 ** 9;
    if (
      whitelistMintSettings?.discountPrice ||
      whitelistMintSettings?.discountPrice === 0
    ) {
      whitelistMintSettings.discountPrice *= 10 ** 9;
    }
    wallet = solTreasuryAccount
      ? new PublicKey(solTreasuryAccount)
      : walletKeyPair.publicKey;
  }

  if (whitelistMintSettings) {
    whitelistMintSettings.mint = new PublicKey(whitelistMintSettings.mint);
    if (
      whitelistMintSettings?.discountPrice ||
      whitelistMintSettings?.discountPrice === 0
    ) {
      whitelistMintSettings.discountPrice = new anchor.BN(
        whitelistMintSettings.discountPrice
      );
    }
  }

  if (endSettings) {
    if (endSettings.endSettingType.date) {
      endSettings.number = new anchor.BN(parseDate(endSettings.value));
    } else if (endSettings.endSettingType.amount) {
      endSettings.number = new anchor.BN(endSettings.value);
    }
    delete endSettings.value;
  }

  if (hiddenSettings) {
    const utf8Encode = new TextEncoder();
    hiddenSettings.hash = utf8Encode.encode(hiddenSettings.hash);
  }

  if (gatekeeper) {
    gatekeeper.gatekeeperNetwork = new PublicKey(gatekeeper.gatekeeperNetwork);
  }

  return {
    storage,
    nftStorageKey,
    ipfsInfuraProjectId,
    number,
    ipfsInfuraSecret,
    pinataJwt,
    pinataGateway: pinataGateway ? pinataGateway : null,
    awsS3Bucket,
    retainAuthority: !noRetainAuthority,
    mutable: !noMutable,
    batchSize,
    price: new anchor.BN(parsedPrice),
    treasuryWallet: wallet,
    splToken: splToken ? new PublicKey(splToken) : null,
    gatekeeper,
    endSettings,
    hiddenSettings,
    whitelistMintSettings,
    goLiveDate: goLiveDate ? new anchor.BN(parseDate(goLiveDate)) : null,
    uuid,
    arweaveJwk,
  };
}
