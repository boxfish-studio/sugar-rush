import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { AnchorProvider, Program, BN } from '@project-serum/anchor'
import { useRPC } from 'hooks'
import { PublicKey, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js'
import { useState } from 'react'
import { CANDY_MACHINE_PROGRAM_V2_ID, CandyMachineAccount } from '@boxfish-studio/candymachine-client-sdk'

const useRefreshCandyMachine = (account: string) => {
    const anchorWallet = useAnchorWallet()
    const { connection, network } = useRPC()
    const [itemsRemaining, setItemsRemaining] = useState(0)
    const [itemsAvailable, setItemsAvailable] = useState(0)
    const [nftPrice, setNftPrice] = useState(0)
    const [isActive, setIsActive] = useState(false)
    const [isCaptcha, setIsCaptcha] = useState(false)
    const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>()

    const wallet = useWallet()

    async function refreshCandyMachineState() {
        try {
            if (!anchorWallet || !wallet.publicKey || !connection || !network) return
            const provider = new AnchorProvider(connection, anchorWallet, {
                preflightCommitment: 'recent',
            })

            const idl = await Program.fetchIdl(CANDY_MACHINE_PROGRAM_V2_ID, provider)
            if (!idl) return
            const program = new Program(idl, CANDY_MACHINE_PROGRAM_V2_ID, provider)
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

    return {
        itemsRemaining,
        itemsAvailable,
        nftPrice,
        isActive,
        refreshCandyMachineState,
        isCaptcha,
        setIsCaptcha,
        candyMachine,
        setItemsRemaining,
        setIsActive,
    }
}

export default useRefreshCandyMachine
