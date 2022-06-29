import { AnchorProvider, Program } from '@project-serum/anchor'
import { AnchorWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey, TransactionInstruction } from '@solana/web3.js'
import { useRPC } from 'hooks'
import { loadCandyProgramV2 } from 'lib/candy-machine/upload/config'
import { sendTransactionWithRetryWithKeypair } from 'lib/candy-machine/upload/transactions'
import { UnwrapPromise } from 'lib/types'

type Transaction = UnwrapPromise<ReturnType<typeof sendTransactionWithRetryWithKeypair>>

type Withdraw = Pick<Transaction, 'txid'> & { balanceChange: number }

const useRemoveCandyMachineAccount = (
    accounts: string[],
    setAccounts: React.Dispatch<React.SetStateAction<string[]>>
) => {
    const anchorWallet = useAnchorWallet()
    const { rpcEndpoint } = useRPC()

    const removeAccount = async (candyMachineAccount: string) => {
        if (!anchorWallet) return
        const provider = new AnchorProvider(rpcEndpoint, anchorWallet, {
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
            setAccounts(accountsFiltered)
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
