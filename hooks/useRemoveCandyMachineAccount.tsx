import { AnchorProvider, Program } from '@project-serum/anchor'
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey, TransactionInstruction, Connection } from '@solana/web3.js'
import { useRPC } from 'hooks'
import { loadCandyProgramV2, sendTransactionWithRetryWithKeypair } from '@boxfish-studio/candymachine-client-sdk'
import { UnwrapPromise } from 'lib/types'

type Transaction = UnwrapPromise<ReturnType<typeof sendTransactionWithRetryWithKeypair>>

type Withdraw = Pick<Transaction, 'txid'> & { balanceChange: number }

const useRemoveCandyMachineAccount = (accounts: string[]) => {
    const anchorWallet = useAnchorWallet()
    const { connection } = useRPC()

    const removeAccount = async (candyMachineAccount: string) => {
        if (!anchorWallet || !connection) return
        const provider = new AnchorProvider(connection, anchorWallet, {
            preflightCommitment: 'recent',
        })

        const anchorProgram = await loadCandyProgramV2(provider)

        async function withdrawV2(
            anchorProgram: Program,
            keypair: AnchorWallet,
            candyAddress: PublicKey
        ): Promise<Withdraw> {
            const instructions: TransactionInstruction[] = [
                await anchorProgram.methods
                    .withdrawFunds()
                    .accounts({
                        candyMachine: candyAddress,
                        authority: keypair.publicKey,
                    })
                    .instruction(),
            ]

            const preBalance = await provider.connection.getBalance(keypair.publicKey)
            const { txid } = await sendTransactionWithRetryWithKeypair(
                anchorProgram.provider.connection,
                anchorWallet!,
                instructions,
                'confirmed'
            )
            await provider.connection.confirmTransaction(txid)
            const postBalance = await provider.connection.getBalance(keypair.publicKey)

            const balanceChange = (postBalance - preBalance) / LAMPORTS_PER_SOL
            const accountsFiltered = accounts.filter((account) => account !== candyAddress.toBase58())
            return {
                txid,
                balanceChange,
            }
        }

        return await withdrawV2(anchorProgram, anchorWallet, new PublicKey(candyMachineAccount))
    }

    return {
        removeAccount,
    }
}

export default useRemoveCandyMachineAccount
