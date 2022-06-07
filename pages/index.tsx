import { Title } from 'components/Layout'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useWallet } from '@solana/wallet-adapter-react'
const Home: NextPage = () => {
  const { publicKey } = useWallet()

  return (
    <div className='relative'>
      <Head>
        <title>Dashboard</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='container flex justify-center items-center flex-col'>
        <>
          <Title text='Welcome ' />
          {publicKey && (
            <span className='break-all mt-4 bg-[hsl(258,52%,62%)] text-white py-2 px-4 rounded-lg text-center'> {publicKey?.toBase58()}</span>
          )}
        </>
      </div>
    </div>
  )
}

export default Home
