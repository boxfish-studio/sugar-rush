/* eslint-disable react-hooks/exhaustive-deps */
import type { NextPage } from 'next'
import Head from 'next/head'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import CandyMachineCard from 'components/FetchCM/CandyMachineCard'
import React, { useEffect, useState } from 'react'
import { useRPC } from 'hooks'
import { CheckConnectedWallet, Spinner, Title } from 'components/Layout'
import Link from 'next/link'

const CANDY_MACHINE_PROGRAM_V2_ID = new PublicKey(
  'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ'
)

const ManageCandyMachines: NextPage = () => {
  const { publicKey, connected } = useWallet()
  const [accounts, setAccounts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const { rpcEndpoint } = useRPC()

  async function fetchAccounts() {
    if (publicKey && connected) {
      try {
        const accounts = await rpcEndpoint.getProgramAccounts(
          CANDY_MACHINE_PROGRAM_V2_ID,
          {
            commitment: 'confirmed',
            filters: [
              {
                memcmp: {
                  offset: 8,
                  bytes: publicKey.toBase58(),
                },
              },
            ],
          }
        )

        if (accounts.length === 0) return setAccounts([''])

        const accountsPubkeys = accounts
          .map((account) => account.pubkey.toBase58())
          .sort()
        setAccounts(accountsPubkeys)
        setError(false)
      } catch (err) {
        console.error(err)
      }
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
  }, [connected])

  if (!connected) {
    return <CheckConnectedWallet />
  }

  return (
    <div className='relative'>
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
            <button
              className='rounded-lg bg-slate-400 p-2 mt-4'
              onClick={fetchAccounts}
            >
              Fetch again
            </button>
          </div>
        )}

        {!isLoading && !error && accounts.length > 0 && accounts[0] !== '' && (
          <CandyMachineCard accounts={accounts} setAccounts={setAccounts} />
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
    </div>
  )
}

export default ManageCandyMachines
