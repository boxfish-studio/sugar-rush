import { FC, useState } from 'react'
import { useRouter } from 'next/router'
import { SearchBar, RefreshButton } from './'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { candyMachineSearchState, candyMachinesState } from 'lib/recoil-store/atoms'
import { Button } from '@primer/react'
import { LinkExternalIcon } from '@primer/octicons-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRPC } from 'hooks'
import { fetchCandyMachineAccounts } from 'lib/utils'
import { Popup, CreateCandyMachine } from 'components'

const TopActions: FC = () => {
    const [searchValue, setSearchValue] = useRecoilState(candyMachineSearchState)
    const { pathname } = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const { publicKey } = useWallet()
    const { rpcEndpoint } = useRPC()
    const [isOpen, setIsOpen] = useState(false)

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
        <div className='d-flex flex-justify-end top-actions-bar d-flex flex-column flex-md-row'>
            {pathname === '/' ? (
                <>
                    <SearchBar
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        placeholderText='Search candy machine'
                    />
                    <Button variant='primary' onClick={() => setIsOpen(true)} sx={{ textTransform: 'capitalize' }}>
                        Create candy machine
                    </Button>
                    {isOpen && (
                        <Popup onClose={() => setIsOpen(false)} title='Create Candy Machine' size='large'>
                            <CreateCandyMachine />
                        </Popup>
                    )}
                    <RefreshButton onClick={refreshCandyMachines} isLoading={isLoading} />
                </>
            ) : (
                <>
                    <Button variant='danger'>Delete</Button>
                    <Button variant='outline'>Verify</Button>
                    <Button leadingIcon={LinkExternalIcon}>View in Solscan</Button>
                </>
            )}
        </div>
    )
}

export default TopActions
