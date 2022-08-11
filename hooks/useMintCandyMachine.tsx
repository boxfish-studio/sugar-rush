import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { AnchorProvider } from '@project-serum/anchor'
import { useRPC, useNotification } from 'hooks'
import { Transaction, Connection } from '@solana/web3.js'
import { awaitTransactionSignatureConfirmation } from 'lib/candy-machine/upload/transactions'
import { useEffect, useState } from 'react'
import { DEFAULT_TIMEOUT } from 'lib/constants'
import { SetupState } from 'lib/candy-machine/interfaces'
import { createAccountsForMint, mintOneNft } from 'lib/candy-machine/mint/mint'
import useRefreshCandyMachine from './useRefreshCandyMachine'
import { NotificationType } from 'lib/interfaces'

const useMintCandyMachine = (account: string) => {
    const anchorWallet = useAnchorWallet()
    const { connection } = useRPC()
    const [isUserMinting, setIsUserMinting] = useState(false)
    const [setupTxn, setSetupTxn] = useState<SetupState>()
    const { itemsRemaining, refreshCandyMachineState, candyMachine, setItemsRemaining, setIsActive, isCaptcha } =
        useRefreshCandyMachine(account as string)
    const { addNotification } = useNotification()

    useEffect(() => {
        refreshCandyMachineState()
    }, [])

    const wallet = useWallet()

    const mintAccount = async (beforeTransactions: Transaction[] = [], afterTransactions: Transaction[] = []) => {
        try {
            if (!anchorWallet || !wallet.publicKey || !connection) return
            setIsUserMinting(true)
            refreshCandyMachineState()

            const provider = new AnchorProvider(connection, anchorWallet, {
                preflightCommitment: 'recent',
            })

            let setupMint: SetupState | undefined = await createAccountsForMint(candyMachine, wallet.publicKey)

            let status: any = { err: true }
            if (setupMint?.transaction) {
                status = await awaitTransactionSignatureConfirmation(
                    setupMint.transaction,
                    DEFAULT_TIMEOUT,
                    provider.connection,
                    undefined,
                    true
                )
            }

            if (status && !status.err) {
                setSetupTxn(setupMint)
            } else {
                setIsUserMinting(false)
                return
            }

            let mintResult = await mintOneNft(
                candyMachine,
                wallet.publicKey,
                beforeTransactions,
                afterTransactions,
                setupMint ?? setupTxn
            )

            let metadataStatus = null
            if (mintResult) {
                status = await awaitTransactionSignatureConfirmation(
                    mintResult.mintTxId,
                    DEFAULT_TIMEOUT,
                    provider.connection,
                    undefined,
                    true
                )

                metadataStatus = await candyMachine?.program.provider.connection.getAccountInfo(
                    mintResult.metadataKey,
                    'processed'
                )
                console.log('Metadata status: ', !!metadataStatus)
            }

            if (status && !status.err && metadataStatus && candyMachine) {
                let remaining = itemsRemaining! - 1
                setItemsRemaining(remaining)
                setIsActive((candyMachine.state.isActive = remaining > 0))
                candyMachine.state.isSoldOut = remaining === 0
                setSetupTxn(undefined)
                addNotification({
                    message: 'Mint succeeded! Please, click the refresh button to see the new NFT.',
                    type: NotificationType.Success,
                })
            } else if (status && !status.err) {
                addNotification({
                    message:
                        'Mint likely failed! Anti-bot SOL 0.01 fee potentially charged! Check the explorer to confirm the mint failed and if so, make sure you are eligible to mint before trying again.',
                    type: NotificationType.Error,
                })
            } else {
                addNotification({
                    message: 'Mint failed! Please try again!',
                    type: NotificationType.Error,
                })
            }
        } catch (err) {
            console.log(err)
            addNotification({
                message: `Mint failed! ${(err as Error)?.message}. Please try again!`,
                type: NotificationType.Error,
            })
        } finally {
            setIsUserMinting(false)
        }
    }

    return {
        mintAccount,
        isUserMinting,
        itemsRemaining,
        isCaptcha,
    }
}

export default useMintCandyMachine
