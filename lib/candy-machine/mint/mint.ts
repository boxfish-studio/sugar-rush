import { web3 } from '@project-serum/anchor'
import { PublicKey, Transaction, SYSVAR_SLOT_HASHES_PUBKEY, SystemProgram } from '@solana/web3.js'
import {
    CANDY_MACHINE_PROGRAM_V2_ID,
    TOKEN_METADATA_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
} from 'lib/candy-machine/mint/constants'
import { getAtaForMint, getCandyMachineCreator, getMasterEdition, getMetadata } from 'lib/candy-machine/mint/helpers'
import { SetupState, CandyMachineAccount } from 'lib/candy-machine/interfaces'
import {
    createInitializeMintInstruction,
    createMintToInstruction,
    createAssociatedTokenAccountInstruction,
    MintLayout,
} from '@solana/spl-token'
import { sendTransactions, SequenceType } from 'lib/candy-machine/upload/transactions'

export const getCollectionPDA = async (candyMachineAddress: web3.PublicKey): Promise<[web3.PublicKey, number]> => {
    return await web3.PublicKey.findProgramAddress(
        [Buffer.from('collection'), candyMachineAddress.toBuffer()],
        CANDY_MACHINE_PROGRAM_V2_ID
    )
}

const getCollectionAuthorityRecordPDA = async (
    mint: web3.PublicKey,
    newAuthority: web3.PublicKey
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
            TOKEN_METADATA_PROGRAM_ID
        )
    )[0]
}

export const createAccountsForMint = async (
    candyMachine: CandyMachineAccount | undefined,
    payer: web3.PublicKey
): Promise<SetupState | undefined> => {
    const mint = web3.Keypair.generate()
    const userTokenAccountAddress = (await getAtaForMint(mint.publicKey, payer))[0]
    const signers: web3.Keypair[] = [mint]

    if (!candyMachine) return

    const instructions = [
        web3.SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: mint.publicKey,
            space: MintLayout.span,
            lamports: await candyMachine.program.provider.connection.getMinimumBalanceForRentExemption(MintLayout.span),
            programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(mint.publicKey, 0, payer, payer, TOKEN_PROGRAM_ID),
        createAssociatedTokenAccountInstruction(payer, userTokenAccountAddress, payer, mint.publicKey),
        createMintToInstruction(mint.publicKey, userTokenAccountAddress, payer, 1, [], TOKEN_PROGRAM_ID),
    ]

    const sendTx = await sendTransactions(
        candyMachine.program.provider.connection,
        // @ts-ignore
        candyMachine.program.provider.wallet,
        [instructions],
        [signers],
        SequenceType.StopOnFailure,
        'singleGossip',
        () => {},
        () => false,
        undefined,
        [],
        []
    )
    console.log(sendTx)

    const txid = sendTx.txs[0].txid

    return {
        mint: mint,
        userTokenAccount: userTokenAccountAddress,
        transaction: txid,
    }
}

type MintResult = {
    mintTxId: string
    metadataKey: web3.PublicKey
}

export const mintOneNft = async (
    candyMachine: CandyMachineAccount | undefined,
    payer: web3.PublicKey,
    beforeTransactions: Transaction[] = [],
    afterTransactions: Transaction[] = [],
    setupState?: SetupState
): Promise<MintResult | null> => {
    const mint = setupState?.mint ?? web3.Keypair.generate()
    const userTokenAccountAddress = (await getAtaForMint(mint.publicKey, payer))[0]

    if (!candyMachine) return null
    const userPayingAccountAddress = candyMachine.state.tokenMint
        ? (await getAtaForMint(candyMachine.state.tokenMint, payer))[0]
        : payer

    const candyMachineAddress = candyMachine.id
    const remainingAccounts = []
    const instructions = []
    const signers: web3.Keypair[] = []
    if (!setupState) {
        signers.push(mint)
        instructions.push(
            ...[
                web3.SystemProgram.createAccount({
                    fromPubkey: payer,
                    newAccountPubkey: mint.publicKey,
                    space: MintLayout.span,
                    lamports: await candyMachine.program.provider.connection.getMinimumBalanceForRentExemption(
                        MintLayout.span
                    ),
                    programId: TOKEN_PROGRAM_ID,
                }),
                createInitializeMintInstruction(mint.publicKey, 0, payer, payer, TOKEN_PROGRAM_ID),
                createAssociatedTokenAccountInstruction(payer, userTokenAccountAddress, payer, mint.publicKey),
                createMintToInstruction(mint.publicKey, userTokenAccountAddress, payer, 1, [], TOKEN_PROGRAM_ID),
            ]
        )
    }

    if (candyMachine.state.whitelistMintSettings) {
        const mint = new web3.PublicKey(candyMachine.state.whitelistMintSettings.mint)

        const whitelistToken = (await getAtaForMint(mint, payer))[0]
        remainingAccounts.push({
            pubkey: whitelistToken,
            isWritable: true,
            isSigner: false,
        })

        if (candyMachine.state.whitelistMintSettings.mode.burnEveryTime) {
            remainingAccounts.push({
                pubkey: mint,
                isWritable: true,
                isSigner: false,
            })
            remainingAccounts.push({
                pubkey: payer,
                isWritable: false,
                isSigner: true,
            })
        }
    }

    if (candyMachine.state.tokenMint) {
        remainingAccounts.push({
            pubkey: userPayingAccountAddress,
            isWritable: true,
            isSigner: false,
        })
        remainingAccounts.push({
            pubkey: payer,
            isWritable: false,
            isSigner: true,
        })
    }
    const metadataAddress = await getMetadata(mint.publicKey)
    const masterEdition = await getMasterEdition(mint.publicKey)

    const [candyMachineCreator, creatorBump] = await getCandyMachineCreator(candyMachineAddress)

    instructions.push(
        await candyMachine.program.instruction.mintNft(creatorBump, {
            accounts: {
                candyMachine: candyMachineAddress,
                candyMachineCreator,
                payer: payer,
                wallet: candyMachine.state.treasury,
                mint: mint.publicKey,
                metadata: metadataAddress,
                masterEdition,
                mintAuthority: payer,
                updateAuthority: payer,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: web3.SYSVAR_RENT_PUBKEY,
                clock: web3.SYSVAR_CLOCK_PUBKEY,
                recentBlockhashes: SYSVAR_SLOT_HASHES_PUBKEY,
                instructionSysvarAccount: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            },
            remainingAccounts: remainingAccounts.length > 0 ? remainingAccounts : undefined,
        })
    )

    const [collectionPDA] = await getCollectionPDA(candyMachineAddress)
    const collectionPDAAccount = await candyMachine.program.provider.connection.getAccountInfo(collectionPDA)

    if (collectionPDAAccount && candyMachine.state.retainAuthority) {
        try {
            const collectionData = (await candyMachine.program.account.collectionPda.fetch(collectionPDA)) as any
            const collectionMint = collectionData.mint
            const collectionAuthorityRecord = await getCollectionAuthorityRecordPDA(collectionMint, collectionPDA)
            if (collectionMint) {
                const collectionMetadata = await getMetadata(collectionMint)
                const collectionMasterEdition = await getMasterEdition(collectionMint)
                instructions.push(
                    await candyMachine.program.instruction.setCollectionDuringMint({
                        accounts: {
                            candyMachine: candyMachineAddress,
                            metadata: metadataAddress,
                            payer: payer,
                            collectionPda: collectionPDA,
                            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                            instructions: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
                            collectionMint,
                            collectionMetadata,
                            collectionMasterEdition,
                            authority: candyMachine.state.authority,
                            collectionAuthorityRecord,
                        },
                    })
                )
            }
        } catch (error) {
            console.error(error)
        }
    }

    try {
        const txns = (
            await sendTransactions(
                candyMachine.program.provider.connection,
                // @ts-ignore
                candyMachine.program.provider.wallet,
                [instructions],
                [signers],
                SequenceType.StopOnFailure,
                'singleGossip',
                () => {},
                () => false,
                undefined,
                beforeTransactions,
                afterTransactions
            )
        ).txs.map((t) => t.txid)
        const mintTxn = txns[0]
        return {
            mintTxId: mintTxn,
            metadataKey: metadataAddress,
        }
    } catch (e) {
        console.log(e)
    }
    return null
}
