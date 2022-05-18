import * as anchor from '@project-serum/anchor';
import {
  CANDY_MACHINE_PROGRAM_V2_ID,
  supportedImageTypes,
  supportedAnimationTypes,
  JSON_EXTENSION,
} from '../constants';

import { PublicKey } from '@solana/web3.js';
import { getMint, TOKEN_PROGRAM_ID, getAccount } from '@solana/spl-token';
import { getAtaForMint, parseDate } from './helpers';
import { WhitelistMintMode, CandyMachineConfig } from '../interfaces';
import { StorageType } from '../enums';

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

export async function loadCandyProgramV2(
  provider: anchor.Provider,
  customRpcUrl?: string
) {
  if (customRpcUrl) console.log('USING CUSTOM URL', customRpcUrl);
  const idl = (await anchor.Program.fetchIdl(
    CANDY_MACHINE_PROGRAM_V2_ID,
    provider
  )) as anchor.Idl;

  const program = new anchor.Program(
    idl,
    CANDY_MACHINE_PROGRAM_V2_ID,
    provider
  );
  console.log('program id from anchor', program.programId.toBase58());
  return program;
}

export async function getCandyMachineV2Config(
  walletKeyPair: PublicKey,
  configForm: CandyMachineConfig,
  anchorProgram: anchor.Program<anchor.Idl>
): Promise<{
  storage: StorageType;
  nftStorageKey: string | null;
  ipfsInfuraProjectId: string | null;
  number: number;
  ipfsInfuraSecret: string | null;
  pinataJwt: string | null;
  pinataGateway: string | null;
  awsS3Bucket: string | null;
  retainAuthority: boolean;
  mutable: boolean;
  batchSize: number | null;
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
  uuid: string | null;
  arweaveJwk: string | null;
}> {
  if (configForm === undefined) {
    throw new Error('The configForm is undefined');
  }

  const config = configForm;

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
    ? (await getAtaForMint(new PublicKey(splToken), walletKeyPair))[0]
    : null;

  if (splToken) {
    if (solTreasuryAccount) {
      throw new Error(
        'If spl-token-account or spl-token is set then sol-treasury-account cannot be set'
      );
    }
    if (!splToken) {
      throw new Error(
        'If spl-token-account is set, spl-token must also be set'
      );
    }
    const splTokenKey = new PublicKey(splToken);
    const splTokenAccountKey = new PublicKey(
      splTokenAccountFigured as anchor.web3.PublicKey
    );
    if (!splTokenAccountFigured) {
      throw new Error(
        'If spl-token is set, spl-token-account must also be set'
      );
    }

    console.log('anchor program loaded', anchorProgram);

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
      (whitelistMintSettings && whitelistMintSettings?.discountPrice) ||
      (whitelistMintSettings &&
        whitelistMintSettings?.discountPrice?.toNumber() === 0)
    ) {
      (whitelistMintSettings.discountPrice as any) *= 10 ** mintInfo.decimals;
    }
  } else {
    parsedPrice = price * 10 ** 9;
    if (
      whitelistMintSettings?.discountPrice ||
      whitelistMintSettings?.discountPrice?.toNumber() === 0
    ) {
      (whitelistMintSettings.discountPrice as any) *= 10 ** 9;
    }
    wallet = solTreasuryAccount
      ? new PublicKey(solTreasuryAccount)
      : walletKeyPair;
  }

  if (whitelistMintSettings) {
    whitelistMintSettings.mint = new PublicKey(whitelistMintSettings.mint);
    if (
      whitelistMintSettings?.discountPrice ||
      whitelistMintSettings?.discountPrice?.toNumber() === 0
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
    hiddenSettings.hash = utf8Encode.encode(hiddenSettings.hash.toString());
  }
  console.log('correct config');

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
    gatekeeper: gatekeeper
      ? {
          gatekeeperNetwork: new PublicKey(gatekeeper.gatekeeperNetwork),
          expireOnUse: gatekeeper.expireOnUse,
        }
      : null,
    endSettings,
    hiddenSettings,
    whitelistMintSettings,
    goLiveDate: goLiveDate ? new anchor.BN(parseDate(goLiveDate)) : null,
    uuid,
    arweaveJwk,
  };
}

/**
 * @typedef {Object} VerifiedAssets
 * @property {File[]} supportedFiles how the person is called
 * @property {number} elemCount how many years the person lived
 */

/**
 *
 * @param files : list of files to analuze (json+image)
 * @param storage : Storage to use
 * @param number :number of assets
 * @returns {VerifiedAssets} returns an array of verified assets and the number of assets
 */

export function verifyAssets(
  files: File[],
  storage: StorageType,
  number: number
): { supportedFiles: File[]; elemCount: number } {
  let imageFileCount = 0;
  let animationFileCount = 0;
  let jsonFileCount = 0;

  /**
   * From the files list, check that the files are valid images and animations or json files.
   */
  const supportedFiles = files.filter((it) => {
    if (supportedImageTypes.some((e) => e === it.type)) {
      imageFileCount++;
    } else if (supportedAnimationTypes.some((e) => e === it.type)) {
      animationFileCount++;
    } else if (it.type == JSON_EXTENSION) {
      jsonFileCount++;
    } else {
      console.warn(`WARNING: Skipping unsupported file type ${it}`);
      return false;
    }

    return true;
  });

  if (animationFileCount !== 0 && storage === StorageType.Arweave) {
    throw new Error(
      'The "arweave" storage option is incompatible with animation files. Please try again with another storage option using `--storage <option>`.'
    );
  }

  if (animationFileCount !== 0 && animationFileCount !== jsonFileCount) {
    throw new Error(
      `number of animation files (${animationFileCount}) is different than the number of json files (${jsonFileCount})`
    );
  } else if (imageFileCount !== jsonFileCount) {
    throw new Error(
      `number of img files (${imageFileCount}) is different than the number of json files (${jsonFileCount})`
    );
  }

  const elemCount = number ? number : imageFileCount;
  if (elemCount < imageFileCount) {
    throw new Error(
      `max number (${elemCount}) cannot be smaller than the number of images in the source folder (${imageFileCount})`
    );
  }

  if (animationFileCount === 0) {
    console.info(`Beginning the upload for ${elemCount} (img+json) pairs`);
  } else {
    console.info(
      `Beginning the upload for ${elemCount} (img+animation+json) sets`
    );
  }
  console.log('supportedFiles', supportedFiles);
  return { supportedFiles, elemCount };
}
