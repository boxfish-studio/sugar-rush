import * as anchor from '@project-serum/anchor';
import {

    CANDY_MACHINE_PROGRAM_V2_ID,
    CONFIG_ARRAY_START_V2,
    CONFIG_LINE_SIZE_V2,
  } from './constants';

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



export async function createCandyMachineV2Account(
    anchorProgram:anchor.Program,
    candyData: CandyMachineData,
    payerWallet:any,
    candyAccount:any,
  ) {
    const size =
      CONFIG_ARRAY_START_V2 +
      4 +
      candyData.itemsAvailable.toNumber() * CONFIG_LINE_SIZE_V2 +
      8 +
      2 * (Math.floor(candyData.itemsAvailable.toNumber() / 8) + 1);
  
    return anchor.web3.SystemProgram.createAccount({
      fromPubkey: payerWallet,
      newAccountPubkey: candyAccount,
      space: size,
      lamports:
        await anchorProgram.provider.connection.getMinimumBalanceForRentExemption(
          size,
        ),
      programId: CANDY_MACHINE_PROGRAM_V2_ID,
    });
  }