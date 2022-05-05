import * as anchor from "@project-serum/anchor";
import { calculate } from "@metaplex/arweave-cost";
import { ARWEAVE_PAYMENT_WALLET } from "../constants";
import { sendTransactionWithRetryWithKeypair } from "./transactions";
import { Manifest } from "./upload";
import { type } from "os";

const ARWEAVE_UPLOAD_ENDPOINT =
  "https://us-central1-metaplex-studios.cloudfunctions.net/uploadFile";

async function fetchAssetCostToStore(fileSizes: number[]) {
  const result = await calculate(fileSizes);
  console.debug("Arweave cost estimates:", result);

  return result.solana * anchor.web3.LAMPORTS_PER_SOL;
}

async function upload(data: FormData, manifest: Manifest, index: number) {
  console.log(`trying to upload image ${index}: ${manifest.name}`);
  console.log("data", data);
  const res =  await (
    await fetch(ARWEAVE_UPLOAD_ENDPOINT, {
      method: "POST",
      body: data,
    })
  ).json();
    console.log("r",res);
  return res;
}

function estimateManifestSize(filenames: string[]) {
  const paths: { [key: string]: any } = {};

  for (const name of filenames) {
    console.log("name", name);
    paths[name] = {
      id: "artestaC_testsEaEmAGFtestEGtestmMGmgMGAV438",
      ext: name.split(".")[1],
    };
  }

  const manifest = {
    manifest: "arweave/paths",
    version: "0.1.0",
    paths,
    index: {
      path: "metadata.json",
    },
  };

  const data = Buffer.from(JSON.stringify(manifest), "utf8");
  console.log("Estimated manifest size:", data.length);
  return data.length;
}

export async function arweaveUpload(
  walletKeyPair: any,
  anchorProgram: anchor.Program,
  env: string,
  image: File,
  manifestBuffer: any, // TODO rename metadataBuffer
  manifest: any, // TODO rename metadata
  index: number
) {
  console.log("arweave upload");
  const imageExt = image.type;
  const estimatedManifestSize = estimateManifestSize([
    image.name,
    "metadata.json",
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
    "confirmed"
  );
  console.log(`solana transaction (${env}) for arweave payment:`, tx);

  const data = new FormData();
  const b = new Blob([image], { type: "image/png" });
  const c = new Blob([manifestBuffer], { type: "application/json" });
  const a = new ReadableStream({
      start(controller){
        controller.enqueue(image);
        controller.close();
      },
    
  })
  data.append("transaction", tx["txid"]);
  data.append("env", env);
  data.append("file[]", a, image.name);
  data.append("file[]", c, "metadata.json");
    
  console.log("d",[...data]);
  const result = await upload(data, manifest, index);

  console.log("result", result);

  const metadataFile = result.messages?.find(
    (m:any) => m.filename === "manifest.json"
  );
  const imageFile = result.messages?.find(
    (m:any) => m.filename === `${index}${imageExt}`
  );
  if (metadataFile?.transactionId) {
    const link = `https://arweave.net/${metadataFile.transactionId}`;
    const imageLink = `https://arweave.net/${
      imageFile.transactionId
    }?ext=${imageExt.replace(".", "")}`;
    console.debug(`File uploaded: ${link}`);
    return [link, imageLink];
  } else {
    // @todo improve
    throw new Error(`No transaction ID for upload: ${index}`);
  }
}
