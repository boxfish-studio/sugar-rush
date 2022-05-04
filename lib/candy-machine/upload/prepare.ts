import * as anchor from '@project-serum/anchor';


  import {
    PublicKey,
  } from '@solana/web3.js';


  export interface WhitelistMintMode {
    neverBurn: undefined | boolean;
    burnEveryTime: undefined | boolean;
  }

  
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
    ArweaveBundle = 'arweave-bundle',
    ArweaveSol = 'arweave-sol',
    Arweave = 'arweave',
    Ipfs = 'ipfs',
    Aws = 'aws',
    NftStorage = 'nft-storage',
    Pinata = 'pinata',
  }


  const {
    keypair,
    env,
    cacheName,
    configPath,
    rpcUrl,
    rateLimit,
    collectionMint,
    setCollectionMint,
  } = cmd.opts();


  /*
   
  get options from CLI

  loadCandyProgramV2

  getCandyMachineV2Config

  parseCollectionMintPubkey

  uploadV2

  */
  

// LOAD CANDY_MACHINE_PROGRAM_V2_ID TO ANOTHER NET THAT IS NOT DEVNET/MAINNET-BETA






    const {
      storage,
      nftStorageKey,
      ipfsInfuraProjectId,
      number,
      ipfsInfuraSecret,
      pinataJwt,
      pinataGateway,
      arweaveJwk,
      awsS3Bucket,
      retainAuthority,
      mutable,
      batchSize,
      price,
      splToken,
      treasuryWallet,
      gatekeeper,
      endSettings,
      hiddenSettings,
      whitelistMintSettings,
      goLiveDate,
      uuid,
    } = await getCandyMachineV2Config(walletKeyPair, anchorProgram, configForm);

    if (storage === StorageType.ArweaveSol && env !== 'mainnet-beta') {
      console.log(
        '\x1b[31m%s\x1b[0m',
        'WARNING: On Devnet, the arweave-sol storage option only stores your files for 1 week. Please upload via Mainnet Beta for your final collection.\n',
      );
    }

    if (storage === StorageType.ArweaveBundle && env !== 'mainnet-beta') {
      throw new Error(
        'The arweave-bundle storage option only works on mainnet because it requires spending real AR tokens. For devnet, please set the --storage option to "aws" or "ipfs"\n',
      );
    }

    if (storage === StorageType.Arweave) {
      log.warn(
        'WARNING: The "arweave" storage option will be going away soon. Please migrate to arweave-bundle or arweave-sol for mainnet.\n',
      );
    }

    if (storage === StorageType.ArweaveBundle && !arweaveJwk) {
      throw new Error(
        'Path to Arweave JWK wallet file (--arweave-jwk) must be provided when using arweave-bundle',
      );
    }
    if (
      storage === StorageType.Ipfs &&
      (!ipfsInfuraProjectId || !ipfsInfuraSecret)
    ) {
      throw new Error(
        'IPFS selected as storage option but Infura project id or secret key were not provided.',
      );
    }
    if (storage === StorageType.Aws && !awsS3Bucket) {
      throw new Error(
        'aws selected as storage option but existing bucket name (--aws-s3-bucket) not provided.',
      );
    }

    if (!Object.values(StorageType).includes(storage)) {
      throw new Error(
        `Storage option must either be ${Object.values(StorageType).join(
          ', ',
        )}. Got: ${storage}`,
      );
    }
    const ipfsCredentials = {
      projectId: ipfsInfuraProjectId,
      secretKey: ipfsInfuraSecret,
    };

    let imageFileCount = 0;
    let animationFileCount = 0;
    let jsonFileCount = 0;

    // Filter out any non-supported file types and find the JSON vs Image file count
    const supportedFiles = files.filter(it => {
      if (supportedImageTypes[getType(it)]) {
        imageFileCount++;
      } else if (supportedAnimationTypes[getType(it)]) {
        animationFileCount++;
      } else if (it.endsWith(EXTENSION_JSON)) {
        jsonFileCount++;
      } else {
        log.warn(`WARNING: Skipping unsupported file type ${it}`);
        return false;
      }

      return true;
    });

    if (animationFileCount !== 0 && storage === StorageType.Arweave) {
      throw new Error(
        'The "arweave" storage option is incompatible with animation files. Please try again with another storage option using `--storage <option>`.',
      );
    }

    if (animationFileCount !== 0 && animationFileCount !== jsonFileCount) {
      throw new Error(
        `number of animation files (${animationFileCount}) is different than the number of json files (${jsonFileCount})`,
      );
    } else if (imageFileCount !== jsonFileCount) {
      throw new Error(
        `number of img files (${imageFileCount}) is different than the number of json files (${jsonFileCount})`,
      );
    }

    const elemCount = number ? number : imageFileCount;
    if (elemCount < imageFileCount) {
      throw new Error(
        `max number (${elemCount}) cannot be smaller than the number of images in the source folder (${imageFileCount})`,
      );
    }

    if (animationFileCount === 0) {
      console.log(`Beginning the upload for ${elemCount} (img+json) pairs`);
    } else {
      console.log(
        `Beginning the upload for ${elemCount} (img+animation+json) sets`,
      );
    }

    const collectionMintPubkey = await parseCollectionMintPubkey(
      collectionMint,
      anchorProgram.provider.connection,
      walletKeyPair,
    );

    const startMs = Date.now();
    console.log('started at: ' + startMs.toString());
    try {
      await uploadV2({
        files: supportedFiles,
        cacheName,
        env,
        totalNFTs: elemCount,
        gatekeeper,
        storage,
        retainAuthority,
        mutable,
        nftStorageKey,
        ipfsCredentials,
        pinataJwt,
        pinataGateway,
        awsS3Bucket,
        batchSize,
        price,
        treasuryWallet,
        anchorProgram,
        walletKeyPair,
        splToken,
        endSettings,
        hiddenSettings,
        whitelistMintSettings,
        goLiveDate,
        uuid,
        arweaveJwk,
        rateLimit,
        collectionMintPubkey,
        setCollectionMint,
        rpcUrl,
      });
    } catch (err) {
      log.warn('upload was not successful, please re-run.', err);
      process.exit(1);
    }
    const endMs = Date.now();
    const timeTaken = new Date(endMs - startMs).toISOString().substr(11, 8);
    console.log(
      `ended at: ${new Date(endMs).toISOString()}. time taken: ${timeTaken}`,
    );
    process.exit(0);
  });