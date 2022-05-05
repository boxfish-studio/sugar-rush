import * as anchor from "@project-serum/anchor";
import {
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  CONFIG_ARRAY_START_V2,
  CONFIG_LINE_SIZE_V2,
  CANDY_MACHINE_PROGRAM_V2_ID,
} from "../constants";

import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AnchorWallet } from "@solana/wallet-adapter-react";

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

export function parseDate(date: string) {
  if (date === "now") {
    return Date.now() / 1000;
  }
  return Date.parse(date) / 1000;
}
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export const getAtaForMint = async (
  mint: anchor.web3.PublicKey,
  buyer: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );
};

export function uuidFromConfigPubkey(configAccount: PublicKey) {
  return configAccount.toBase58().slice(0, 6);
}

export const createCandyMachineV2 = async function (
  anchorProgram: anchor.Program,
  payerWallet: AnchorWallet,
  treasuryWallet: PublicKey,
  // splToken: PublicKey,
  candyData: CandyMachineData
) {
  const candyAccount = Keypair.generate();
  candyData.uuid = uuidFromConfigPubkey(candyAccount.publicKey);

  if (!candyData.symbol) {
    throw new Error(`Invalid config, there must be a symbol.`);
  }

  if (!candyData.creators || candyData.creators.length === 0) {
    throw new Error(`Invalid config, there must be at least one creator.`);
  }

  const totalShare = (candyData.creators || []).reduce(
    (acc, curr) => acc + curr.share,
    0
  );

  if (totalShare !== 100) {
    throw new Error(`Invalid config, creators shares must add up to 100`);
  }

  let remainingAccounts:any[] = [];
  // if (splToken) {
  //   remainingAccounts.push({
  //     pubkey: splToken,
  //     isSigner: false,
  //     isWritable: false,
  //   });
  // }
  const cmCreation =  {
    candyMachine: candyAccount.publicKey,
    uuid: candyData.uuid,
    txId: await anchorProgram.methods
      .initializeCandyMachine(candyData).
        accounts({
          candyMachine: candyAccount.publicKey,
          wallet: treasuryWallet,
          authority: payerWallet.publicKey,
          payer: payerWallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        }).
        // MAYBE NEED TO ADD PAYER WALLET
        signers([ candyAccount]).
        remainingAccounts(remainingAccounts).
        preInstructions([
          await createCandyMachineV2Account(
            anchorProgram,
            candyData,
            payerWallet.publicKey,
            candyAccount.publicKey
          ),
        ])      
      .rpc(),
  };
  console.log("cmCreation",cmCreation);
  return cmCreation;
};

export async function createCandyMachineV2Account(
  anchorProgram:anchor.Program,
  candyData: CandyMachineData,
  payerWallet:PublicKey,
  candyAccount:PublicKey
) {
  console.log("creating v2 account");
  const size =
    CONFIG_ARRAY_START_V2 +
    4 +
    candyData.itemsAvailable.toNumber() * CONFIG_LINE_SIZE_V2 +
    8 +
    2 * (Math.floor(candyData.itemsAvailable.toNumber() / 8) + 1);

  const account = anchor.web3.SystemProgram.createAccount({
    fromPubkey: payerWallet,
    newAccountPubkey: candyAccount,
    space: size,
    lamports:
      await anchorProgram.provider.connection.getMinimumBalanceForRentExemption(
        size
      ),
    programId: CANDY_MACHINE_PROGRAM_V2_ID,
  });
  console.log("account created",account);
  return account;
}
