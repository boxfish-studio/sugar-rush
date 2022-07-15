import { Button } from '@primer/react'
import { candyMachinesState } from 'lib/recoil-store/atoms'
import { FC, useState } from 'react'
import { fetchCandyMachineAccounts } from 'lib/utils'
import { SyncIcon } from '@primer/octicons-react'
import { useRPC } from 'hooks'
import { useSetRecoilState } from 'recoil'
import { useWallet } from '@solana/wallet-adapter-react'

const RefreshButton: FC = () => {
    const [isLoading, setIsLoading] = useState(false)
    const { publicKey } = useWallet()
    const { rpcEndpoint } = useRPC()
    const setCandyMachines = useSetRecoilState(candyMachinesState)

    const refreshCandyMachines = async () => {
        setIsLoading(true)
        try {
            const candyMachines = await fetchCandyMachineAccounts(rpcEndpoint, publicKey!)
            setCandyMachines(candyMachines)
        } catch (e) {
            console.error(e)
        }
        setIsLoading(false)
    }

    return (
        <Button className={isLoading ? 'loading-animation' : ''} leadingIcon={SyncIcon} onClick={refreshCandyMachines}>
            Refresh
        </Button>
    )
}
export default RefreshButton
