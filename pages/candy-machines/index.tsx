/* eslint-disable react-hooks/exhaustive-deps */
import { useWallet } from '@solana/wallet-adapter-react'
import { CandyMachineList, CreateCandyMachine, Popup, SearchBar, RefreshButton } from 'components'
import { useRPC } from 'hooks'
import { candyMachinesState, candyMachineSearchState } from 'lib/recoil-store/atoms'
import { fetchCandyMachineAccounts } from 'lib/utils'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { Button, Spinner } from '@primer/react'
import { useRecoilValue, useSetRecoilState } from 'recoil'

const ManageCandyMachines: NextPage = () => {
    const [accounts, setAccounts] = useRecoilState(candyMachinesState)
    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshLoading, setIsRefreshLoading] = useState(false)
    const [error, setError] = useState(false)
    const { connection } = useRPC()
    const { publicKey } = useWallet()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [searchValue, setSearchValue] = useRecoilState(candyMachineSearchState)
    const searchInput = useRecoilValue(candyMachineSearchState)
    const setCandyMachines = useSetRecoilState(candyMachinesState)

    const searchResults = accounts.filter((account) => {
        return account.toLowerCase().includes(searchInput.trim().toLowerCase())
    })
    const fetchAccounts = async () => {
        if (!connection) return
        try {
            const accounts = await fetchCandyMachineAccounts(connection, publicKey!)
            setAccounts(accounts)
            setError(false)
        } catch (err) {
            console.error(err)
        }
    }

    const refreshCandyMachines = async () => {
        setIsRefreshLoading(true)
        if (!connection) return
        try {
            const candyMachines = await fetchCandyMachineAccounts(connection, publicKey!)
            setCandyMachines(candyMachines)
        } catch (e) {
            console.error(e)
        }
        setIsRefreshLoading(false)
    }

    useEffect(() => {
        if (!connection) return

        setError(false)
        setIsLoading(true)

        fetchAccounts()
            .catch(() => setError(true))
            .finally(() => {
                setIsLoading(false)
            })
    }, [connection])

    if (isLoading) {
        return (
            <div className='d-flex width-full height-full flex-justify-center flex-items-center'>
                <Spinner />
            </div>
        )
    }

    return (
        <>
            <Head>
                <title>Candy Machines</title>
                <meta name='description' content='Generated by create next app' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <div className='d-flex flex-justify-end column-gap-1 flex-row flex-md-row'>
                <SearchBar
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    placeholderText='Search candy machine'
                />
                <Button variant='primary' onClick={() => setIsCreateOpen(true)} sx={{ textTransform: 'capitalize' }}>
                    Create candy machine
                </Button>
                <RefreshButton onClick={refreshCandyMachines} isLoading={isRefreshLoading} />
            </div>
            <div className='d-flex flex-column'>
                <div className='d-flex my-5 flex-items-center'>
                    <h2>Candy Machines ·</h2>
                    <h2 className='ml-2'>{accounts?.length}</h2>
                </div>
                {error ? (
                    <div className='d-flex flex-column flex-items-center flex-justify-center mt-11'>
                        Error fetching accounts
                        <Button variant='danger' className='mt-4' onClick={fetchAccounts}>
                            Fetch again
                        </Button>
                    </div>
                ) : !accounts?.length ? (
                    <div className='mt-5 d-flex flex-column flex-md-row flex-items-start flex-md-items-center '>
                        <div className='mr-2'>You have no candy machine accounts.</div>
                        <Button
                            className='color-bg-transparent text-semibold'
                            variant='invisible'
                            onClick={() => setIsCreateOpen(true)}
                            sx={{ textTransform: 'capitalize', padding: '0' }}
                        >
                            Create one?
                        </Button>
                    </div>
                ) : (
                    <CandyMachineList candyMachineAccounts={searchResults} />
                )}
                {isCreateOpen && (
                    <Popup onClose={() => setIsCreateOpen(false)} title='Create Candy Machine' size='large'>
                        <CreateCandyMachine />
                    </Popup>
                )}
            </div>
        </>
    )
}

export default ManageCandyMachines
