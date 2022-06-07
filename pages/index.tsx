import { CheckConnectedWallet, Title } from 'components/Layout'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useWallet } from '@solana/wallet-adapter-react'
const Home: NextPage = () => {
  const { publicKey } = useWallet()

  if (!publicKey) {
    return <CheckConnectedWallet />
  }

  return (
    <>
      <Head>
        <title>Dashboard</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='flex justify-center items-center flex-col'>
        <>
          <Title text='Welcome ' />
        </>
      </div>
    </>
  )
}

export default Home
