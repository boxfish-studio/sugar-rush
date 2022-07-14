/* eslint-disable react-hooks/exhaustive-deps */
import { useWallet } from '@solana/wallet-adapter-react'
import { CandyMachineCard, Spinner, Title } from 'components'
import { useRPC } from 'hooks'
import { CANDY_MACHINE_PROGRAM_V2_ID } from 'lib/candy-machine/constants'
import { candyMachinesState } from 'lib/recoil-store/atoms'
import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'

const ManageCandyMachines: NextPage = () => {
    const { publicKey } = useWallet()
    const [accounts, setAccounts] = useRecoilState(candyMachinesState)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(false)
    const { rpcEndpoint } = useRPC()

    const fetchAccounts = async () => {
        try {
            const accounts = await rpcEndpoint.getProgramAccounts(CANDY_MACHINE_PROGRAM_V2_ID, {
                commitment: 'confirmed',
                filters: [
                    {
                        memcmp: {
                            offset: 8,
                            bytes: publicKey!.toBase58(),
                        },
                    },
                ],
            })

            if (accounts.length === 0) return setAccounts([''])

            const accountsPubkeys = accounts.map((account) => account.pubkey.toBase58()).sort()
            setAccounts(accountsPubkeys)
            setError(false)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        setError(false)
        setIsLoading(true)

        fetchAccounts()
            .catch(() => setError(true))
            .finally(() => {
                setIsLoading(false)
            })
    }, [])
    return isLoading ? (
        <div className='d-flex width-full height-full flex-justify-center flex-items-center'>
            <Spinner />
        </div>
    ) : (
        <>
            <Head>
                <title>Manage Candy Machine</title>
                <meta name='description' content='Generated by create next app' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <div className='container flex justify-center items-center flex-col'>
                <Title text='Manage Candy Machine' />

                {!error && accounts.length === 0 && <Spinner />}
                {error && !isLoading && (
                    <div className='flex flex-col items-center justify-center mt-11'>
                        Error fetching accounts
                        <button className='rounded-lg bg-slate-400 p-2 mt-4' onClick={fetchAccounts}>
                            Fetch again
                        </button>
                    </div>
                )}

                {!isLoading && !error && accounts.length > 0 && accounts[0] !== '' && (
                    <CandyMachineCard candyMachineAccounts={accounts} setCandyMachineAccounts={setAccounts} />
                )}
                {!isLoading && !error && accounts[0] === '' && (
                    <span className='mt-5'>
                        You have no candy machine accounts.{' '}
                        <Link href='/create-candy-machine'>
                            <a className='text-[hsl(258,52%,62%)] hover:underline'>Create one?</a>
                        </Link>
                    </span>
                )}
            </div>
        </>
    )
}

export default ManageCandyMachines
