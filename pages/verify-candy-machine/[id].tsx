import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Title } from 'components/Layout';
import Head from 'next/head';
import { useUploadCache, useVerifyCandyMachineV2 } from 'hooks';

const VerifyCandyMachine: NextPage = () => {
  const router = useRouter();
  const account = router.query.id;
  const { cache, uploadCache } = useUploadCache();

  const { error, loading, verifyCandyMachine, message, connection } =
    useVerifyCandyMachineV2(cache);
  console.log(connection.rpcEndpoint);
  return (
    <>
      <Head>
        <title>Verify Candy Machine</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='flex justify-center items-center flex-col'>
        <Title text='Verify Candy Machine' />
        <span className='mt-8'>
          {account}{' '}
          <a
            className='text-blue-700'
            href={`https://solscan.io/account/${account}${
              connection.rpcEndpoint.includes('devnet') ? '?cluster=devnet' : ''
            }`}
          >
            View in Solscan
          </a>
        </span>
        <div className='mt-7 flex flex-col justify-center items-center gap-3'>
          <label htmlFor='cache'>Cache file</label>

          <input type='file' name='cache' onChange={uploadCache} />
        </div>
        <button
          className='bg-slate-500 w-fit p-4 rounded-2xl mt-6 text-white'
          onClick={() => verifyCandyMachine({ account })}
        >
          {loading && <span>...</span>}
          {!loading && !error.error && <span>Verify CM</span>}
          {!loading && error.error && <span>Verify CM</span>}
        </button>
        {!error.error && message &&(
          <div className='border border-cyan-500 mx-36 mt-10 p-5 rounded-xl text-black'>
            {message}
          </div>
        )}

        {!loading && error.error && (
          <div className='border border-red-500 mx-36 mt-10 p-5 rounded-xl'>
            {error.message}
          </div>
        )}
      </div>
    </>
  );
};

export default VerifyCandyMachine;
