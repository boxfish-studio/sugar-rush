import { useAnchorWallet, useWallet, useConnection } from '@solana/wallet-adapter-react'
import { AnchorProvider, Program, BN, web3 } from '@project-serum/anchor'
import { useRPC } from 'hooks'
import { loadCandyProgramV2 } from 'lib/upload/config'
import {
  PublicKey,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  Transaction,
  SYSVAR_SLOT_HASHES_PUBKEY,
  SystemProgram, 
  Keypair
} from '@solana/web3.js'
import { awaitTransactionSignatureConfirmation, sendTransactions, SequenceType } from 'lib/upload/transactions'
import { UnwrapPromise, Account } from 'lib/types'
import { useEffect, useState } from 'react'
import { CANDY_MACHINE_PROGRAM_V2_ID, CIVIC, DEFAULT_TIMEOUT, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID, TOKEN_PROGRAM_ID } from 'lib/constants'
import { SetupState, CandyMachineAccount, CollectionData } from 'lib/interfaces'
import { getAtaForMint, getCandyMachineCreator, getMasterEdition, getMetadata, getNetworkExpire, getNetworkToken } from 'lib/utils'
import { AccountLayout, MintLayout, transfer, setAuthority, createMintToInstruction, mintTo, getOrCreateAssociatedTokenAccount, createMint, getMint, createMultisig } from '@solana/spl-token';

// type Withdraw = Pick<Transaction, 'txid'> & { balanceChange: number }
const getCollectionPDA = async (
  candyMachineAddress: web3.PublicKey,
): Promise<[web3.PublicKey, number]> => {
  return await web3.PublicKey.findProgramAddress(
    [Buffer.from('collection'), candyMachineAddress.toBuffer()],
    CANDY_MACHINE_PROGRAM_V2_ID,
  );
};

export const getCollectionAuthorityRecordPDA = async (
  mint: web3.PublicKey,
  newAuthority: web3.PublicKey,
): Promise<web3.PublicKey> => {
  return (
    await web3.PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('collection_authority'),
        newAuthority.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
};

// const createAssociatedTokenAccountInstruction = (
//   associatedTokenAddress: web3.PublicKey,
//   payer: web3.PublicKey,
//   walletAddress: web3.PublicKey,
//   splTokenMintAddress: web3.PublicKey,
// ) => {
//   const keys = [
//     { pubkey: payer, isSigner: true, isWritable: true },
//     { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
//     { pubkey: walletAddress, isSigner: false, isWritable: false },
//     { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
//     {
//       pubkey: web3.SystemProgram.programId,
//       isSigner: false,
//       isWritable: false,
//     },
//     { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
//     {
//       pubkey: web3.SYSVAR_RENT_PUBKEY,
//       isSigner: false,
//       isWritable: false,
//     },
//   ];
//   return new web3.TransactionInstruction({
//     keys,
//     programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
//     data: Buffer.from([]),
//   });
// };

// export const createAccountsForMint = async (
//   candyMachine: CandyMachineAccount | undefined,
//   wallet: any
// ): Promise<SetupState | undefined> => {
//   const mint = web3.Keypair.generate();
//   const userTokenAccountAddress = (
//     await getAtaForMint(mint.publicKey, wallet.publicKey)
//   )[0];

//   const signers: web3.Keypair[] = [mint];

//   if (!candyMachine) return
//   const instructions = [
//     web3.SystemProgram.createAccount({
//       fromPubkey: wallet.publicKey,
//       newAccountPubkey: mint.publicKey,
//       space: MintLayout.span,
//       lamports:
//         await candyMachine.program.provider.connection.getMinimumBalanceForRentExemption(
//           MintLayout.span,
//         ),
//       programId: TOKEN_PROGRAM_ID,
//     }),
//     // createInitMintInstruction(
//     //   TOKEN_PROGRAM_ID,
//     //   mint.publicKey,
//     //   0,
//     //   wallet.publicKey,
//     //   wallet.publicKey,
//     // ),
//     createAssociatedTokenAccountInstruction(
//       userTokenAccountAddress,
//       wallet.publicKey,
//       wallet.publicKey,
//       mint.publicKey,
//     ),
//     createMintToInstruction(
//       mint.publicKey,
//       userTokenAccountAddress,
//       TOKEN_PROGRAM_ID,
//       1,
//       [],
//       wallet.publicKey,
//     ),
//   ];

//   console.log("wallet", wallet);
//   console.log("instructions", instructions);
//   console.log("signers", signers);

//   const instructionsMatrix = [instructions];
//   const signersMatrix = [signers];

//   return {
//     mint: mint,
//     userTokenAccount: userTokenAccountAddress,
//     transaction: (
//       await sendTransactions(
//         candyMachine.program.provider.connection,
//         wallet,
//         instructionsMatrix,
//         signersMatrix,
//         SequenceType.StopOnFailure,
//         'singleGossip',
//         () => {},
//         () => false,
//         undefined,
//         [],
//         [],
//       )
//     ).txs[0].txid,
//   };
// };

// type MintResult = {
//   mintTxId: string;
//   metadataKey: web3.PublicKey;
// };

// export const mintOneToken = async (
//   candyMachine: CandyMachineAccount | undefined,
//   payer: web3.PublicKey,
//   beforeTransactions: Transaction[] = [],
//   afterTransactions: Transaction[] = [],
//   setupState?: SetupState,
//   wallet?: any
// ): Promise<MintResult | null> => {
//   const mint = setupState?.mint ?? web3.Keypair.generate();
//   const userTokenAccountAddress = (
//     await getAtaForMint(mint.publicKey, payer)
//   )[0];
//   if (!candyMachine) return null

//   const userPayingAccountAddress = candyMachine.state.tokenMint
//     ? (await getAtaForMint(candyMachine.state.tokenMint, payer))[0]
//     : payer;

//   const candyMachineAddress = candyMachine.id;
//   const remainingAccounts = [];
//   const instructions = [];
//   const signers: web3.Keypair[] = [];
//   console.log('SetupState: ', setupState);
//   if (!setupState) {
//     signers.push(mint);
//     instructions.push(
//       ...[
//         web3.SystemProgram.createAccount({
//           fromPubkey: payer,
//           newAccountPubkey: mint.publicKey,
//           space: MintLayout.span,
//           lamports:
//             await candyMachine.program.provider.connection.getMinimumBalanceForRentExemption(
//               MintLayout.span,
//             ),
//           programId: TOKEN_PROGRAM_ID,
//         }),
//         // createInitMintInstruction(
//         //   TOKEN_PROGRAM_ID,
//         //   mint.publicKey,
//         //   0,
//         //   payer,
//         //   payer,
//         // ),
//         createAssociatedTokenAccountInstruction(
//           userTokenAccountAddress,
//           payer,
//           payer,
//           mint.publicKey,
//         ),
//         createMintToInstruction(
//           mint.publicKey,
//           userTokenAccountAddress,
//           TOKEN_PROGRAM_ID,
//           1,
//           [],
//           payer,
//         ),
//       ],
//     );
//   }

//   if (candyMachine.state.gatekeeper) {
//     remainingAccounts.push({
//       pubkey: (
//         await getNetworkToken(
//           payer,
//           candyMachine.state.gatekeeper.gatekeeperNetwork,
//         )
//       )[0],
//       isWritable: true,
//       isSigner: false,
//     });

//     if (candyMachine.state.gatekeeper.expireOnUse) {
//       remainingAccounts.push({
//         pubkey: CIVIC,
//         isWritable: false,
//         isSigner: false,
//       });
//       remainingAccounts.push({
//         pubkey: (
//           await getNetworkExpire(
//             candyMachine.state.gatekeeper.gatekeeperNetwork,
//           )
//         )[0],
//         isWritable: false,
//         isSigner: false,
//       });
//     }
//   }
//   if (candyMachine.state.whitelistMintSettings) {
//     const mint = new web3.PublicKey(
//       candyMachine.state.whitelistMintSettings.mint,
//     );

//     const whitelistToken = (await getAtaForMint(mint, payer))[0];
//     remainingAccounts.push({
//       pubkey: whitelistToken,
//       isWritable: true,
//       isSigner: false,
//     });

//     if (candyMachine.state.whitelistMintSettings.mode.burnEveryTime) {
//       remainingAccounts.push({
//         pubkey: mint,
//         isWritable: true,
//         isSigner: false,
//       });
//       remainingAccounts.push({
//         pubkey: payer,
//         isWritable: false,
//         isSigner: true,
//       });
//     }
//   }

//   if (candyMachine.state.tokenMint) {
//     remainingAccounts.push({
//       pubkey: userPayingAccountAddress,
//       isWritable: true,
//       isSigner: false,
//     });
//     remainingAccounts.push({
//       pubkey: payer,
//       isWritable: false,
//       isSigner: true,
//     });
//   }
//   const metadataAddress = await getMetadata(mint.publicKey);
//   const masterEdition = await getMasterEdition(mint.publicKey);

//   const [candyMachineCreator, creatorBump] = await getCandyMachineCreator(
//     candyMachineAddress,
//   );

//   console.log(remainingAccounts.map(rm => rm.pubkey.toBase58()));
//   instructions.push(
//     await candyMachine.program.instruction.mintNft(creatorBump, {
//       accounts: {
//         candyMachine: candyMachineAddress,
//         candyMachineCreator,
//         payer: payer,
//         wallet: candyMachine.state.treasury,
//         mint: mint.publicKey,
//         metadata: metadataAddress,
//         masterEdition,
//         mintAuthority: payer,
//         updateAuthority: payer,
//         tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
//         tokenProgram: TOKEN_PROGRAM_ID,
//         systemProgram: SystemProgram.programId,
//         rent: web3.SYSVAR_RENT_PUBKEY,
//         clock: web3.SYSVAR_CLOCK_PUBKEY,
//         recentBlockhashes: SYSVAR_SLOT_HASHES_PUBKEY,
//         instructionSysvarAccount: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
//       },
//       remainingAccounts:
//         remainingAccounts.length > 0 ? remainingAccounts : undefined,
//     }),
//   );

//   const [collectionPDA] = await getCollectionPDA(candyMachineAddress);
//   const collectionPDAAccount =
//     await candyMachine.program.provider.connection.getAccountInfo(
//       collectionPDA,
//     );
//     console.log("collectionPDA", collectionPDA);
//     console.log("collectionPDAAccount", collectionPDAAccount);
    

//   if (collectionPDAAccount && candyMachine.state.retainAuthority) {
//     try {
//       const collectionData =
//         (await candyMachine.program.account.collectionPda.fetch(
//           collectionPDA,
//         )) as CollectionData;
//       console.log("-------------------------collectionData-------------------------");
//       console.log(collectionData);
//       const collectionMint = collectionData.mint;
//       const collectionAuthorityRecord = await getCollectionAuthorityRecordPDA(
//         collectionMint,
//         collectionPDA,
//       );
//       console.log(collectionMint);
//       if (collectionMint) {
//         const collectionMetadata = await getMetadata(collectionMint);
//         const collectionMasterEdition = await getMasterEdition(collectionMint);
//         console.log('Collection PDA: ', collectionPDA.toBase58());
//         console.log('Authority: ', candyMachine.state.authority.toBase58());
//         instructions.push(
//           await candyMachine.program.instruction.setCollectionDuringMint({
//             accounts: {
//               candyMachine: candyMachineAddress,
//               metadata: metadataAddress,
//               payer: payer,
//               collectionPda: collectionPDA,
//               tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
//               instructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
//               collectionMint,
//               collectionMetadata,
//               collectionMasterEdition,
//               authority: candyMachine.state.authority,
//               collectionAuthorityRecord,
//             },
//           }),
//         );
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   const instructionsMatrix = [instructions];
//   const signersMatrix = [signers];

//   try {
//     const txns = (
//       await sendTransactions(
//         candyMachine.program.provider.connection,
//         wallet,
//         instructionsMatrix,
//         signersMatrix,
//         SequenceType.StopOnFailure,
//         'singleGossip',
//         () => {},
//         () => false,
//         undefined,
//         beforeTransactions,
//         afterTransactions,
//       )
//     ).txs.map(t => t.txid);
//     const mintTxn = txns[0];
//     return {
//       mintTxId: mintTxn,
//       metadataKey: metadataAddress,
//     };
//   } catch (e) {
//     console.log(e);
//   }
//   return null;
// };

const useMintCandyMachine = (
  account: string
) => {
  const anchorWallet = useAnchorWallet()
  const { rpcEndpoint } = useRPC()
  const [isUserMinting, setIsUserMinting] = useState(false);
  const [itemsRemaining, setItemsRemaining] = useState(0);
  const [nftPrice, setNftPrice] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [setupTxn, setSetupTxn] = useState<SetupState>();
  const [needTxnSplit, setNeedTxnSplit] = useState(true);
  const [message, setMessage] = useState('')
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();

  const { connection } = useConnection()

  const wallet = useWallet()

  async function refreshCandyMachineState() {
    if (!anchorWallet || !wallet.publicKey) return
    const provider = new AnchorProvider(rpcEndpoint, anchorWallet, {
      preflightCommitment: 'recent',
    })

    const idl = await Program.fetchIdl(
      CANDY_MACHINE_PROGRAM_V2_ID,
      provider
    )

    const program = new Program(idl!, CANDY_MACHINE_PROGRAM_V2_ID, provider)
    const state: any = await program.account.candyMachine.fetch(
      new PublicKey(account)
    )

    const [collectionPDA] = await getCollectionPDA(new PublicKey(account));
    const collectionPDAAccount = await connection.getAccountInfo(
      collectionPDA,
    );    

    const txnEstimate =
            892 +
            (!!collectionPDAAccount && state.retainAuthority ? 182 : 0) +
            (state.tokenMint ? 66 : 0) +
            (state.whitelistMintSettings ? 34 : 0) +
            (state.whitelistMintSettings?.mode?.burnEveryTime ? 34 : 0) +
            (state.gatekeeper ? 33 : 0) +
            (state.gatekeeper?.expireOnUse ? 66 : 0);    

    setNeedTxnSplit(txnEstimate > 1230);

    const itemsAvailable = state.data.itemsAvailable.toNumber();
    const itemsRedeemed = state.itemsRedeemed.toNumber();
    const itemsRemaining = itemsAvailable - itemsRedeemed;
    let nftPrice = new BN(state.data.price).toNumber()  / LAMPORTS_PER_SOL
    let active = new BN(state.goLiveDate).toNumber() < new Date().getTime() / 1000;    

    setItemsRemaining(itemsRemaining)
    setNftPrice(nftPrice)
    setIsActive(active)

    setCandyMachine({
      id: new PublicKey(account),
      program,
      state: {
        authority: state.authority,
        itemsAvailable,
        itemsRedeemed,
        itemsRemaining,
        isSoldOut: itemsRemaining === 0,
        isActive: false,
        isPresale: false,
        isWhitelistOnly: false,
        goLiveDate: state.data.goLiveDate,
        treasury: state.wallet,
        tokenMint: state.tokenMint,
        gatekeeper: state.data.gatekeeper,
        endSettings: state.data.endSettings,
        whitelistMintSettings: state.data.whitelistMintSettings,
        hiddenSettings: state.data.hiddenSettings,
        price: state.data.price,
        retainAuthority: state.data.retainAuthority,
      }
    });
  }

  const mintAccount = async (
    // beforeTransactions: Transaction[] = [],
    // afterTransactions: Transaction[] = [],
    ) => {
    try {
    // const wallet = useWallet();
    if (!anchorWallet || !wallet.publicKey) return
    setIsUserMinting(true);
    refreshCandyMachineState();


    // Generate a new wallet keypair and airdrop SOL
    // const fromWallet = Keypair.generate();
    // const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);

    // // Wait for airdrop confirmation
    // await connection.confirmTransaction(fromAirdropSignature);

    // // Create new token mint
    // const mint = await createMint(connection, fromWallet, fromWallet.publicKey, null, 1, undefined, undefined, CANDY_MACHINE_PROGRAM_V2_ID);

    // // Get the token account of the fromWallet address, and if it does not exist, create it
    // const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    //     connection,
    //     fromWallet,
    //     mint,
    //     fromWallet.publicKey
    // );

    // // Get the token account of the toWallet address, and if it does not exist, create it
    // const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, wallet.publicKey);

    // // Mint 1 new token to the "fromTokenAccount" account we just created
    // let signature = await mintTo(
    //     connection,
    //     fromWallet,
    //     mint,
    //     fromTokenAccount.address,
    //     fromWallet.publicKey,
    //     1000000000,
    //     []
    // );
    // console.log('mint tx:', signature);

    // // Transfer the new token to the "toTokenAccount" we just created
    // signature = await transfer(
    //     connection,
    //     fromWallet,
    //     fromTokenAccount.address,
    //     toTokenAccount.address,
    //     fromWallet.publicKey,
    //     1000000000,
    //     []
    // );
    // console.log('transfer tx:', signature);
    
        
    // let setupMint: SetupState | undefined;
    
    
    // if (needTxnSplit && setupTxn === undefined) {      
    //   setMessage('Please sign account setup transaction');
    //   setupMint = await createAccountsForMint(
    //     candyMachine,
    //     wallet
    //   );
    //   console.log("--------------------", setupMint);
      
    //   let status: any = { err: true };
    //   if (setupMint?.transaction) {
    //     status = await awaitTransactionSignatureConfirmation(
    //       setupMint.transaction,
    //       DEFAULT_TIMEOUT,
    //       connection,
    //       'confirmed',
    //       true,
    //     );
    //   }
    //   console.log(status);
      
    //   if (status && !status.err) {
    //     setSetupTxn(setupMint);
    //     setMessage('Setup transaction succeeded! Please sign minting transaction');
    //   } else {
    //     setMessage('Mint failed! Please try again!');
    //     setIsUserMinting(false);
    //     return;
    //   }
    // } else {      
    //   setMessage('Please sign minting transaction');
    // }

    // console.log("PRevio a mintear el token");  
    // const payer = Keypair.generate();
    // console.log(payer);
    

    // const signer1 = Keypair.generate();
    // const signer2 = Keypair.generate();
    // const signer3 = Keypair.generate();

    // console.log("Previo a generar el keypair");
    

    // const multisigKey = await createMultisig(
    //   connection,
    //   payer,
    //   [
    //     signer1.publicKey,
    //     signer2.publicKey,
    //     signer3.publicKey
    //   ],
    //   2
    // );

    // console.log("multisigKey", multisigKey);
    

    // const mint = await createMint(
    //   connection,
    //   payer,
    //   payer.publicKey,
    //   null,
    //   0
    // );

    // console.log("mint", mint);

    // const toWallet = Keypair.generate();

    // const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
    //   connection,
    //   payer,
    //   mint,
    //   toWallet.publicKey
    // );

    // console.log("associatedTokenAccount", associatedTokenAccount);

    // try {
    //   let signature = await mintTo(
    //     connection,
    //     payer,
    //     mint,
    //     associatedTokenAccount.address,
    //     payer.publicKey,
    //     1
    //   )

    //   await setAuthority(
    //     connection,
    //     payer,            // Payer of the transaction fees
    //     mint,                  // Account 
    //     payer.publicKey,  // Current authority 
    //     0,                     // Authority type: "0" represents Mint Tokens 
    //     null                   // Setting the new Authority to null
    //   );
      
    //   signature = await transfer(
    //     connection,
    //     payer,               // Payer of the transaction fees 
    //     associatedTokenAccount.address, // Source account 
    //     new PublicKey(account),   // Destination account 
    //     payer.publicKey,     // Owner of the source account 
    //     1                         // Number of tokens to transfer 
    //   );
      
        
    //    console.log("SIGNATURE", signature)
    // } catch (e) {
    //   console.log(e);
    // }

    // const mintInfo = await getMint(
    //   connection,
    //   mint
    // )

    // console.log(`Minted ${mintInfo.supply} token`);
    
    // let mintResult = await mintOneToken(
    //   candyMachine,
    //   wallet.publicKey,
    //   beforeTransactions,
    //   afterTransactions,
    //   setupMint ?? setupTxn,
    //   wallet
    // );

      // let status: any = { err: true };
      // let metadataStatus = null;
      // if (mintResult) {
      //   status = await awaitTransactionSignatureConfirmation(
      //     mintResult.mintTxId,
      //     DEFAULT_TIMEOUT,
      //     connection,
      //     'confirmed',
      //     true,
      //   );

      //   metadataStatus =
      //     await candyMachine?.program.provider.connection.getAccountInfo(
      //       mintResult.metadataKey,
      //       'processed',
      //     );
      //   console.log('Metadata status: ', !!metadataStatus);
      // }

    //   if (status && !status.err && metadataStatus && candyMachine) {
    //     // manual update since the refresh might not detect
    //     // the change immediately
    //     let remaining = itemsRemaining! - 1;
    //     setItemsRemaining(remaining);
    //     setIsActive((candyMachine.state.isActive = remaining > 0));
    //     candyMachine.state.isSoldOut = remaining === 0;
    //     setSetupTxn(undefined);
    //     setMessage('Congratulations! Mint succeeded!');
    //     refreshCandyMachineState();
    //   } else if (status && !status.err) {
    //     setMessage('Mint likely failed! Anti-bot SOL 0.01 fee potentially charged! Check the explorer to confirm the mint failed and if so, make sure you are eligible to mint before trying again.');
    //     refreshCandyMachineState();
    //   } else {
    //     setMessage('Mint failed! Please try again!');
    //     refreshCandyMachineState();
    //   }
    //   setIsUserMinting(false)
    
    //   } catch (error: any) {
    //     setIsUserMinting(false)
    //     let message = error.msg || 'Minting failed! Please try again!';
    //     if (!error.msg) {
    //       if (!error.message) {
    //         message = 'Transaction timeout! Please try again.';
    //       } else if (error.message.indexOf('0x137')) {
    //         console.log(error);
    //         message = `SOLD OUT!`;
    //       } else if (error.message.indexOf('0x135')) {
    //         message = `Insufficient funds to mint. Please fund your wallet.`;
    //       }
    //     } else {
    //       if (error.code === 311) {
    //         console.log(error);
    //         message = `SOLD OUT!`;
    //         window.location.reload();
    //       } else if (error.code === 312) {
    //         message = `Minting period hasn't started yet.`;
    //       }
    //   }
    setIsUserMinting(false)

    }
    catch (err) {
      console.log(err);
      setIsUserMinting(false)
    }
  }

  return {
    mintAccount,
    isUserMinting,
    itemsRemaining,
    nftPrice,
    isActive,
    refreshCandyMachineState,
    message
  }
}

export default useMintCandyMachine
