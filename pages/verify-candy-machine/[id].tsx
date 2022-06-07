import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { Title, CheckConnectedWallet, ActionButton } from 'components/Layout'
import Head from 'next/head'
import { useUploadCache, useVerifyCandyMachineV2 } from 'hooks'
import { useWallet } from '@solana/wallet-adapter-react'

const VerifyCandyMachine: NextPage = () => {
  const router = useRouter()
  const account = router.query.id
  const { cache, uploadCache } = useUploadCache()
  const { connected } = useWallet()
  const { error, isLoading, verifyCandyMachine, message, connection } =
    useVerifyCandyMachineV2(cache)
  return (
    <div className='relative'>
      <Head>
        <title>Verify Candy Machine</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {connected ? (
        <div className='container flex justify-center items-center flex-col text-center'>
          <Title text='Verify Candy Machine' />
          <div className='mt-8 flex flex-col text-center'>
            <span className='break-all border border-slate-300 shadow-xl py-2 px-4 rounded-lg text-center'>
              {account}{' '}
            </span>
            <a
              className='text-[hsl(258,52%,56%)] mt-4'
              href={`https://solscan.io/account/${account}${connection.rpcEndpoint.includes('devnet')
                ? '?cluster=devnet'
                : ''
                }`}
              target='_blank'
              rel='noopener noreferrer'
            >
              View in Solscan
            </a>
          </div>
          <div className='flex flex-col justify-center items-center gap-3'>
            <label htmlFor='cache' className="my-8 px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-100 transition-all duration-300 ease-linear font-medium border border-gray-500 inline-block cursor-pointer">Upload Cache file</label>
            <input id="cache" type='file' name='cache' onChange={uploadCache} className='w-full p-2 hidden' />
          </div>

          {isLoading && (
            <ActionButton text='Verifying Candy Machine...' isLoading />
          )}

          {!isLoading && (
            <ActionButton
              text='Verify Candy Machine'
              onClick={() => verifyCandyMachine({ account })}
            />
          )}
          {!error && message && (
            <div className='text-[hsl(258,52%,56%)] text-center mt-6'>
              {message}
            </div>
          )}

          {!isLoading && error && (
            <div className='text-red-500 text-center mt-6'>
              {error}
            </div>
          )}
        </div>
      ) : (
        <CheckConnectedWallet />
      )}
    </div>
  )
}

export default VerifyCandyMachine
