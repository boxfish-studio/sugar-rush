import * as anchor from '@project-serum/anchor';
import { calculate } from '@metaplex/arweave-cost';
import { ARWEAVE_PAYMENT_WALLET, ARWEAVE_UPLOAD_ENDPOINT } from '../constants';
import { sendTransactionWithRetryWithKeypair } from './transactions';
import { Manifest } from '../types';
import { getFileExtension } from './helpers';
import { AnchorWallet } from '@solana/wallet-adapter-react';

/**
 * @param fileSizes - array of file sizes
 * @returns {Promise<number>} - estimated cost to store files in lamports
 */
async function fetchAssetCostToStore(fileSizes: number[]): Promise<number> {
  const result = await calculate(fileSizes);
  console.log('Arweave cost estimates:', result);

  return result.solana * anchor.web3.LAMPORTS_PER_SOL;
}

/**
 * After doing a tx to the metaplex arweave wallet to store the NFTs and their metadata, this function calls a serverless function from metaplex
 * in which the files to upload are attached to the http form.
 * @param data - FormData object
 * @param manifest json manifest containing metadata
 * @param index index of the NFTs to upload
 * @returns http response
 */
async function upload(data: FormData, manifest: Manifest, index: number) {
  console.log(`trying to upload image ${index}: ${manifest.name}`);
  const res = await (
    await fetch(ARWEAVE_UPLOAD_ENDPOINT, {
      method: 'POST',
      body: data,
    })
  ).json();
  return res;
}

function estimateManifestSize(filenames: string[]) {
  const paths: { [key: string]: any } = {};
  for (const name of filenames) {
    console.log('name', name);
    paths[name] = {
      id: 'artestaC_testsEaEmAGFtestEGtestmMGmgMGAV438',
      ext: getFileExtension(name),
    };
  }

  const manifest = {
    manifest: 'arweave/paths',
    version: '0.1.0',
    paths,
    index: {
      path: 'metadata.json',
    },
  };

  const data = Buffer.from(JSON.stringify(manifest), 'utf8');
  console.log('Estimated manifest size:', data.length);
  return data.length;
}

export async function arweaveUpload(
  walletKeyPair: AnchorWallet,
  anchorProgram: anchor.Program,
  env: string,
  image: File,
  manifestBuffer: Buffer,
  manifest: Manifest,
  index: number
) {
  const imageExt = image.type;
  const estimatedManifestSize = estimateManifestSize([
    image.name,
    'metadata.json',
  ]);

  const storageCost = await fetchAssetCostToStore([
    image.size,
    manifestBuffer.length,
    estimatedManifestSize,
  ]);

  console.log(`lamport cost to store ${image.name}: ${storageCost}`);

  const instructions = [
    anchor.web3.SystemProgram.transfer({
      fromPubkey: walletKeyPair.publicKey,
      toPubkey: ARWEAVE_PAYMENT_WALLET,
      lamports: storageCost,
    }),
  ];

  const tx = await sendTransactionWithRetryWithKeypair(
    anchorProgram.provider.connection,
    walletKeyPair,
    instructions,
    'confirmed'
  );
  console.log(`solana transaction (${env}) for arweave payment:`, tx);

  const data = new FormData();
  const manifestBlob = new Blob([manifestBuffer], { type: 'application/json' });

  data.append('transaction', tx['txid']);
  data.append('env', env);
  data.append('file[]', image, image.name);
  data.append('file[]', manifestBlob, 'metadata.json');

  const result = await upload(data, manifest, index);

  console.log('result', result);

  const metadataFile = result.messages?.find(
    (m: any) => m.filename === 'manifest.json'
  );
  const imageFile = result.messages?.find(
    (m: any) => m.filename === image.name
  );

  if (metadataFile?.transactionId) {
    const link = `https://arweave.net/${metadataFile.transactionId}`;
    const imageLink = `https://arweave.net/${
      imageFile.transactionId
    }?ext=${imageExt.replace('.', '')}`;
    console.log(`File uploaded: ${link}`);
    console.log(`imageLink uploaded: ${imageLink}`);

    return [link, imageLink];
  } else {
    // @todo improve
    throw new Error(`No transaction ID for upload: ${index}`);
  }
}
