import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { AnchorProvider, Program, BN } from '@project-serum/anchor'
import { useRPC } from 'hooks'
import { PublicKey, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js'
import { awaitTransactionSignatureConfirmation } from 'lib/candy-machine/upload/transactions'
import { useState } from 'react'
import { CANDY_MACHINE_PROGRAM_V2_ID } from 'lib/candy-machine/mint/constants'
import { DEFAULT_TIMEOUT } from 'lib/constants'
import { SetupState, CandyMachineAccount } from 'lib/candy-machine/interfaces'
import { createAccountsForMint, mintOneNft } from 'lib/candy-machine/mint/mint'

const useMintCandyMachine = (account: string) => {
    const anchorWallet = useAnchorWallet()
    const { connection } = useRPC()
    const [isUserMinting, setIsUserMinting] = useState(false)
    const [itemsRemaining, setItemsRemaining] = useState(0)
    const [itemsAvailable, setItemsAvailable] = useState(0)
    const [nftPrice, setNftPrice] = useState(0)
    const [isActive, setIsActive] = useState(false)
    const [isCaptcha, setIsCaptcha] = useState(false)
    const [setupTxn, setSetupTxn] = useState<SetupState>()
    const [mintMessage, setMintMessage] = useState({ error: false, message: '' })
    const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>()

    const wallet = useWallet()

    async function refreshCandyMachineState() {
        try {
            if (!anchorWallet || !wallet.publicKey || !connection) return
            const provider = new AnchorProvider(connection, anchorWallet, {
                preflightCommitment: 'recent',
            })

            const idl = await Program.fetchIdl(CANDY_MACHINE_PROGRAM_V2_ID, provider)

            const program = new Program(idl!, CANDY_MACHINE_PROGRAM_V2_ID, provider)
            const state: any = await program.account.candyMachine.fetch(new PublicKey(account))
            const itemsAvailable = state.data.itemsAvailable.toNumber()
            const itemsRedeemed = state.itemsRedeemed.toNumber()
            const itemsRemaining = itemsAvailable - itemsRedeemed
            const captcha = !!state.data.gatekeeper
            let nftPrice = new BN(state.data.price).toNumber() / LAMPORTS_PER_SOL
            let active = new BN(state.goLiveDate).toNumber() < new Date().getTime() / 1000

            setItemsRemaining(itemsRemaining)
            setItemsAvailable(itemsAvailable)
            setNftPrice(nftPrice)
            setIsActive(active)
            setIsCaptcha(captcha)

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
                },
            })
        } catch (err) {
            console.error(err)
        }
    }

    const mintAccount = async (beforeTransactions: Transaction[] = [], afterTransactions: Transaction[] = []) => {
        try {
            if (!anchorWallet || !wallet.publicKey || !connection) return
            setIsUserMinting(true)
            refreshCandyMachineState()

            let setupMint: SetupState | undefined = await createAccountsForMint(candyMachine, wallet.publicKey)

            let status: any = { err: true }
            if (setupMint?.transaction) {
                status = await awaitTransactionSignatureConfirmation(
                    setupMint.transaction,
                    DEFAULT_TIMEOUT,
                    connection,
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
                    connection,
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
                setMintMessage({ error: false, message: 'Congratulations! Mint succeeded!' })
            } else if (status && !status.err) {
                setMintMessage({
                    error: true,
                    message:
                        'Mint likely failed! Anti-bot SOL 0.01 fee potentially charged! Check the explorer to confirm the mint failed and if so, make sure you are eligible to mint before trying again.',
                })
            } else {
                setMintMessage({ error: true, message: 'Mint failed! Please try again!' })
            }
        } catch (err) {
            console.log(err)
        } finally {
            setIsUserMinting(false)
        }
    }

    return {
        mintAccount,
        isUserMinting,
        itemsRemaining,
        itemsAvailable,
        nftPrice,
        isActive,
        refreshCandyMachineState,
        mintMessage,
        isCaptcha,
        setIsCaptcha,
    }
}

export default useMintCandyMachine
