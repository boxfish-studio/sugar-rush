// import path from 'path';
// import log from 'loglevel';
import { createCandyMachineV2 } from "./helpers";
import { PublicKey } from "@solana/web3.js";
import { BN, Program, web3 } from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { PromisePool } from "@supercharge/promise-pool";

import { saveCache } from "./cache";
import { arweaveUpload } from "./arweave";
// import {
//   makeArweaveBundleUploadGenerator,
//   withdrawBundlr,
// } from '../helpers/upload/arweave-bundle';
// import { awsUpload } from '../helpers/upload/aws';
// import { ipfsCreds, ipfsUpload } from '../helpers/upload/ipfs';

import { StorageType } from "./config";
import { sleep } from "./helpers";
// import { nftStorageUpload } from '../helpers/upload/nft-storage';
// import { pinataUpload } from '../helpers/upload/pinata';
// import { setCollection } from './set-collection';

type AssetKey = { mediaExt: string; index: string };

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
}: // arweaveJwk,
// rateLimit,
// collectionMintPubkey,
// setCollectionMint,
// rpcUrl,
{
  files: File[];
  cacheName: string;
  env: "mainnet-beta" | "devnet";
  totalNFTs: number;
  storage: string;
  retainAuthority: boolean;
  mutable: boolean;
  // nftStorageKey: string;
  // ipfsCredentials: ipfsCreds;
  // pinataJwt: string;
  // pinataGateway: string;
  // awsS3Bucket: string;
  batchSize: number | null;
  price: BN;
  treasuryWallet: PublicKey;
  // splToken: PublicKey;
  gatekeeper: null | {
    expireOnUse: boolean;
    gatekeeperNetwork: web3.PublicKey;
  };
  goLiveDate: null | BN;
  endSettings: null | [number, BN];
  whitelistMintSettings: null | {
    mode: any;
    mint: PublicKey;
    presale: boolean;
    discountPrice: null | BN;
  };
  hiddenSettings: null | {
    name: string;
    uri: string;
    hash: Uint8Array;
  };
  // uuid: string;
  walletKeyPair: AnchorWallet;
  anchorProgram: Program;
  // arweaveJwk: string;
  // rateLimit: number;
  // collectionMintPubkey: null | PublicKey;
  // setCollectionMint: boolean;
  // rpcUrl: null | string;
}): Promise<boolean> {
  // const savedContent = loadCache(cacheName, env);
  let cacheContent: any =
    //  savedContent
    //  ||
    {};
  const filesNames = files.map((file) => file.name);

  // if (!cacheContent.program) {
  //   cacheContent.program = {};
  // }

  // if (!cacheContent.items) {
  //   cacheContent.items = {};
  // }

  const dedupedAssetKeys = getAssetKeysNeedingUpload(
    // cacheContent.items,
    [],
    filesNames
  );
  // const dirname = path.dirname(files[0]);
  let candyMachine =
    // cacheContent.program.candyMachine
    //   ? new PublicKey(cacheContent.program.candyMachine)
    //   :
    undefined;

  if (!cacheContent?.program?.uuid) {
    // const firstAssetManifest = getAssetManifest(dirname, "0");
    const firstAssetManifest = JSON.parse(
      await files[0].text()
    ) as unknown as Manifest;

    try {
      // const remainingAccounts = [];

      // if (splToken) {
      //   const splTokenKey = new PublicKey(splToken);

      //   remainingAccounts.push({
      //     pubkey: splTokenKey,
      //     isWritable: false,
      //     isSigner: false,
      //   });
      // }

      if (
        !firstAssetManifest.properties?.creators?.every(
          (creator) => creator.address !== undefined
        )
      ) {
        throw new Error("Creator address is missing");
      }

      // initialize candy
      console.info(`initializing candy machine`);
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
            };
          }),
        }
      );
      cacheContent.program.uuid = res.uuid;
      cacheContent.program.candyMachine = res.candyMachine.toBase58();
      candyMachine = res.candyMachine;

      // if (setCollectionMint) {
      //   const collection = await setCollection(
      //     walletKeyPair,
      //     anchorProgram,
      //     res.candyMachine,
      //     collectionMintPubkey
      //   );
      //   console.log("Collection: ", collection);
      //   cacheContent.program.collection = collection.collectionMetadata;
      // } else {
      //   console.log("No collection set");
      // }

      console.info(
        `initialized config for a candy machine with publickey: ${res.candyMachine.toBase58()}`
      );

      saveCache(cacheName, env, cacheContent);
    } catch (exx) {
      console.error("Error deploying config to Solana network.", exx);
      throw exx;
    }
  } else {
    console.info(
      `config for a candy machine with publickey: ${cacheContent?.program.candyMachine} has been already initialized`
    );
  }
  // TODO CHANGE ANY
  const uploadedItems = Object.values(cacheContent.items).filter(
    (f: any) => !!f.link
  ).length;

  console.info(
    `[${uploadedItems}] out of [${totalNFTs}] items have been uploaded`
  );

  if (dedupedAssetKeys.length) {
    console.info(
      `Starting upload for [${
        dedupedAssetKeys.length
      }] items, format ${JSON.stringify(dedupedAssetKeys[0])}`
    );
  }

  if (dedupedAssetKeys.length) {
    if (
      storage === StorageType.ArweaveBundle ||
      storage === StorageType.ArweaveSol
    ) {
      // Initialize the Arweave Bundle Upload Generator.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
      // const arweaveBundleUploadGenerator = makeArweaveBundleUploadGenerator(
      //   storage,
      //   dirname,
      //   dedupedAssetKeys,
      //   env,
      //   storage === StorageType.ArweaveBundle
      //     ? JSON.parse((await readFile(arweaveJwk)).toString())
      //     : undefined,
      //   storage === StorageType.ArweaveSol ? walletKeyPair : undefined,
      //   batchSize,
      //   rpcUrl
      // );
      // Loop over every uploaded bundle of asset filepairs (PNG + JSON)
      // and save the results to the Cache object, persist it to the Cache file.
      // for await (const value of arweaveBundleUploadGenerator) {
      //   const { cacheKeys, arweavePathManifestLinks, updatedManifests } = value;
      //   updateCacheAfterUpload(
      //     cacheContent,
      //     cacheKeys,
      //     arweavePathManifestLinks,
      //     updatedManifests.map((m) => m.name)
      //   );
      //   saveCache(cacheName, env, cacheContent);
      //   log.info("Saved bundle upload result to cache.");
      // }
      // log.info("Upload done. Cleaning up...");
      // if (storage === StorageType.ArweaveSol && env !== "devnet") {
      //   log.info("Waiting 5 seconds to check Bundlr balance.");
      //   await sleep(5000);
      //   await withdrawBundlr(walletKeyPair);
      // }
    } else {
      // const progressBar = new cliProgress.SingleBar(
      //   {
      //     format: "Progress: [{bar}] {percentage}% | {value}/{total}",
      //   },
      //   cliProgress.Presets.shades_classic
      // );
      // progressBar.start(dedupedAssetKeys.length, 0);

      await PromisePool.withConcurrency(batchSize || 10)
        .for(dedupedAssetKeys)
        .handleError(async (err, asset) => {
          console.error(
            `\nError uploading ${JSON.stringify(asset)} asset (skipping)`,
            err.message
          );
          await sleep(5000);
        })
        .process(async (asset) => {
          const jsonFile = files.find((file)=>file.name === asset.index && file.type === "application/json");
          if(!jsonFile) {
            throw new Error(`JSON file ${asset.index}.json is missing`);
          }
          const manifest = getAssetManifest(
            asset.index,
            JSON.parse(await jsonFile?.text()) as unknown as Manifest
          );

          const image = files.find((file)=>file.name === asset.index && manifest.image.startsWith(file.name));
          // const animation =
          //   "animation_url" in manifest
          //     ? path.join(dirname, `${manifest.animation_url}`)
          //     : undefined;
          const manifestBuffer = Buffer.from(JSON.stringify(manifest));

          // if (
          //   animation &&
          //   (!fs.existsSync(animation) || !fs.lstatSync(animation).isFile())
          // ) {
          //   throw new Error(
          //     `Missing file for the animation_url specified in ${asset.index}.json`
          //   );
          // }

          let link, imageLink, animationLink;
          try {
            switch (storage) {
              // case StorageType.Pinata:
              //   [link, imageLink, animationLink] = await pinataUpload(
              //     image,
              //     animation,
              //     manifestBuffer,
              //     pinataJwt,
              //     pinataGateway
              //   );
              //   break;
              // case StorageType.NftStorage:
              //   [link, imageLink, animationLink] = await nftStorageUpload(
              //     image,
              //     animation,
              //     manifestBuffer,
              //     walletKeyPair,
              //     env,
              //     nftStorageKey
              //   );
              //   break;
              // case StorageType.Ipfs:
              //   [link, imageLink, animationLink] = await ipfsUpload(
              //     ipfsCredentials,
              //     image,
              //     animation,
              //     manifestBuffer
              //   );
              //   break;
              // case StorageType.Aws:
              //   [link, imageLink, animationLink] = await awsUpload(
              //     awsS3Bucket,
              //     image,
              //     animation,
              //     manifestBuffer
              //   );
              //   break;
              case StorageType.Arweave:
              default:
                [link, imageLink] = await arweaveUpload(
                  walletKeyPair,
                  anchorProgram,
                  env,
                  image,
                  manifestBuffer,
                  manifest,
                  asset.index
                );
            }
            // if (
            //   animation ? link && imageLink && animationLink : link && imageLink
            // ) {
            //   log.debug("Updating cache for ", asset.index);
            //   cacheContent.items[asset.index] = {
            //     link,
            //     imageLink,
            //     name: manifest.name,
            //     onChain: false,
            //   };
            //   saveCache(cacheName, env, cacheContent);
            // }
          } 
          finally {
            // progressBar.increment();
          }
        });
      // progressBar.stop();
    }
    saveCache(cacheName, env, cacheContent);
  }

  let uploadSuccessful = true;
  if (!hiddenSettings) {
    uploadSuccessful = await writeIndices({
      anchorProgram,
      cacheContent,
      cacheName,
      env,
      candyMachine,
      walletKeyPair,
      rateLimit,
    });

    const uploadedItems = Object.values(cacheContent.items).filter(
      (f: any) => !!f.link
    ).length;
    uploadSuccessful = uploadSuccessful && uploadedItems === totalNFTs;
  } else {
    console.info("Skipping upload to chain as this is a hidden Candy Machine");
  }

  console.log(`Done. Successful = ${uploadSuccessful}.`);
  return uploadSuccessful;
}

/**
 * The Cache object, represented in its minimal form.
 */
type Cache = {
  program: {
    config?: string;
  };
  items: {
    [key: string]: any;
  };
};

/**
 * The Manifest object for a given asset.
 * This object holds the contents of the asset's JSON file.
 * Represented here in its minimal form.
 */
type Manifest = {
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

/**
 * From the Cache object & a list of file paths, return a list of asset keys
 * (filenames without extension nor path) that should be uploaded, sorted numerically in ascending order.
 * Assets which should be uploaded either are not present in the Cache object,
 * or do not truthy value for the `link` property.
 */
function getAssetKeysNeedingUpload(
  items: Cache["items"],
  files: string[]
): AssetKey[] {
  const all = [...new Set([...Object.keys(items), ...files])];
  const keyMap: any = {};
  const assets = all
    .filter((k) => !k.includes(".json"))
    .reduce((acc: AssetKey[], assetKey) => {
      const [key, ext] = assetKey.split(".");

      if (!items[key]?.link && !keyMap[key]) {
        keyMap[key] = true;
        acc.push({ mediaExt: ext, index: key });
      }
      return acc;
    }, [])
    .sort(
      (a, b) => Number.parseInt(a.index, 10) - Number.parseInt(b.index, 10)
    );
  console.log(assets);
  return assets;
}

/**
 * Returns a Manifest from a path and an assetKey
 * Replaces image.ext => index.ext
 * Replaces animation_url.ext => index.ext
 */
export function getAssetManifest(assetIndex: string,manifest: Manifest): Manifest {
 


  manifest.image = manifest.image.replace("image", assetIndex);

  if ("animation_url" in manifest) {
    manifest.animation_url = manifest.animation_url.replace(
      "animation_url",
      assetIndex
    );
  }
  return manifest;
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
  anchorProgram: Program;
  cacheContent: any;
  cacheName: string;
  env: any;
  candyMachine: any;
  walletKeyPair: AnchorWallet;
  rateLimit: number;
}) {
  let uploadSuccessful = true;
  const keys = Object.keys(cacheContent.items);
  const poolArray = [];
  const allIndicesInSlice = Array.from(Array(keys.length).keys());
  let offset = 0;
  while (offset < allIndicesInSlice.length) {
    let length = 0;
    let lineSize = 0;
    let configLines = allIndicesInSlice.slice(offset, offset + 16);
    while (
      length < 850 &&
      lineSize < 16 &&
      configLines[lineSize] !== undefined
    ) {
      length +=
        cacheContent.items[keys[configLines[lineSize]]].link.length +
        cacheContent.items[keys[configLines[lineSize]]].name.length;
      if (length < 850) lineSize++;
    }
    configLines = allIndicesInSlice.slice(offset, offset + lineSize);
    offset += lineSize;
    const onChain = configLines.filter(
      (i) => cacheContent.items[keys[i]]?.onChain || false
    );
    const index = keys[configLines[0]];
    if (onChain.length != configLines.length) {
      poolArray.push({ index, configLines });
    }
  }
  console.info(`Writing all indices in ${poolArray.length} transactions...`);
  const progressBar = new cliProgress.SingleBar(
    {
      format: "Progress: [{bar}] {percentage}% | {value}/{total}",
    },
    cliProgress.Presets.shades_classic
  );
  progressBar.start(poolArray.length, 0);

  const addConfigLines = async ({ index, configLines }) => {
    const response = await anchorProgram.methods.addConfigLines(
      index,
      configLines.map((i) => ({
        uri: cacheContent.items[keys[i]].link,
        name: cacheContent.items[keys[i]].name,
      })),
      {
        accounts: {
          candyMachine,
          authority: walletKeyPair.publicKey,
        },
        signers: [walletKeyPair],
      }
    ).rpc();
    console.debug(response);
    configLines.forEach((i) => {
      cacheContent.items[keys[i]] = {
        ...cacheContent.items[keys[i]],
        onChain: true,
        verifyRun: false,
      };
    });
    saveCache(cacheName, env, cacheContent);
    progressBar.increment();
  };

  await PromisePool.withConcurrency(rateLimit || 5)
    .for(poolArray)
    .handleError(async (err, { index, configLines }) => {
      log.error(
        `\nFailed writing indices ${index}-${
          keys[configLines[configLines.length - 1]]
        }: ${err.message}`
      );
      await sleep(5000);
      uploadSuccessful = false;
    })
    .process(async ({ index, configLines }) => {
      await addConfigLines({ index, configLines });
    });
  progressBar.stop();
  saveCache(cacheName, env, cacheContent);
  return uploadSuccessful;
}

/**
 * Save the Candy Machine's authority (public key) to the Cache object / file.
 */
function setAuthority(publicKey, cache, cacheName, env) {
  cache.authority = publicKey.toBase58();
  saveCache(cacheName, env, cache);
}

/**
 * Update the Cache object for assets that were uploaded with their matching
 * Manifest link. Also set the `onChain` property to `false` so we know this
 * asset should later be appended to the deployed Candy Machine program's
 * configuration on chain.
 */
function updateCacheAfterUpload(
  cache: Cache,
  cacheKeys: Array<keyof Cache["items"]>,
  links: string[],
  names: string[]
) {
  cacheKeys.forEach((cacheKey, idx) => {
    cache.items[cacheKey] = {
      link: links[idx],
      name: names[idx],
      onChain: false,
    };
  });
}

type UploadParams = {
  files: string[];
  cacheName: string;
  env: "mainnet-beta" | "devnet";
  keypair: string;
  storage: string;
  rpcUrl: string;
  ipfsCredentials: ipfsCreds;
  awsS3Bucket: string;
  arweaveJwk: string;
  batchSize: number;
};
