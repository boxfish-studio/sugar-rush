import { FC, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { SearchBar, RefreshButton } from './'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { candyMachineSearchState, candyMachinesState } from 'lib/recoil-store/atoms'
import { Button, Link } from '@primer/react'
import { LinkExternalIcon } from '@primer/octicons-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRPC } from 'hooks'
import { fetchCandyMachineAccounts } from 'lib/utils'
import { Popup, CreateCandyMachine } from 'components'
import VerifyCandyMachine from './VerifyCandyMachine'
import DeleteCandyMachine from './DeleteCandyMachine'
const TopActions: FC = () => {
    const [searchValue, setSearchValue] = useRecoilState(candyMachineSearchState)
    const { pathname, query } = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const { publicKey } = useWallet()
    const { connection, isDevnet } = useRPC()
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isVerifyOpen, setIsVerifyOpen] = useState(false)
    const candyMachineAccount = query?.id

    const setCandyMachines = useSetRecoilState(candyMachinesState)

    const refreshCandyMachines = async () => {
        setIsLoading(true)
        if (!connection) return
        try {
            const candyMachines = await fetchCandyMachineAccounts(connection, publicKey!)
            setCandyMachines(candyMachines)
        } catch (e) {
            console.error(e)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        setIsDeleteOpen(false)
    }, [query])

    return (
        <div className='d-flex flex-justify-end column-gap-1 d-flex flex-column flex-md-row'>
            {pathname === '/candy-machines' ? (
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
                    <Button variant='danger' onClick={() => setIsDeleteOpen(true)}>
                        Delete
                    </Button>
                    {isDeleteOpen && (
                        <Popup onClose={() => setIsDeleteOpen(false)} title='Delete Candy Machine' size='small'>
                            <DeleteCandyMachine candyMachineAccount={candyMachineAccount as string} />
                        </Popup>
                    )}
                    <Button variant='outline' onClick={() => setIsVerifyOpen(true)}>
                        Verify
                    </Button>
                    {isVerifyOpen && (
                        <Popup onClose={() => setIsVerifyOpen(false)} title={`Verify Candy Machine`} size='small'>
                            <VerifyCandyMachine candyMachineAccount={candyMachineAccount as string} />
                        </Popup>
                    )}
                    <Button leadingIcon={LinkExternalIcon}>
                        <Link
                            target='_blank'
                            href={`https://solscan.io/account/${candyMachineAccount}?${isDevnet}`}
                            sx={{ textDecoration: 'none', color: '#24292F' }}
                        >
                            View in Solscan
                        </Link>
                    </Button>
                </>
            )}
        </div>
    )
}

export default TopActions
