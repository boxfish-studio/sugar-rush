import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Program, AnchorProvider, BN } from '@project-serum/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Spinner, Title } from 'components/Layout';
import Head from 'next/head';
import { useUploadCache } from 'hooks';
import { saveCache } from 'lib/candy-machine/cache';
import {
  CONFIG_ARRAY_START_V2,
  CONFIG_LINE_SIZE_V2,
} from 'lib/candy-machine/constants';
import { chunks, fromUTF8Array } from 'lib/candy-machine/verify/helpers';

const CANDY_MACHINE_PROGRAM = new PublicKey(
  'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ'
);

type Account = string | string[] | undefined;

const VerifyCandyMachine: NextPage = () => {
  const router = useRouter();
  const account = router.query.id;
  const { cache, uploadCache } = useUploadCache();
  const { connection } = useConnection();
  const [error, setError] = useState({ error: false, message: '' });
  const anchorWallet = useAnchorWallet();
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);

  async function verifyCandyMachine({
    account,
    connection,
  }: {
    account: Account;
    connection: Connection;
  }) {
    if (account && anchorWallet && cache) {
      const cacheContent = JSON.parse(await cache.text());
      const cacheName = cacheContent.cacheName;
      const env = cacheContent.env;

      try {
        setLoading(true);

        const provider = new AnchorProvider(connection, anchorWallet, {
          preflightCommitment: 'processed',
        });

        const idl = await Program.fetchIdl(CANDY_MACHINE_PROGRAM, provider);

        const program = new Program(idl!, CANDY_MACHINE_PROGRAM, provider);

        const candyMachine = await program.provider.connection.getAccountInfo(
          new PublicKey(account)
        );

        const candyMachineObj: any = await program.account.candyMachine.fetch(
          new PublicKey(account)
        );
        let allGood = true;

        const keys = Object.keys(cacheContent.items)
          .filter((k) => !cacheContent.items[k].verifyRun)
          .sort((a, b) => Number(a) - Number(b));

        if (keys.length > 0) {
          setMessage(
            `Checking ${keys.length} items that have yet to be checked...`
          );
        }

        await Promise.all(
          chunks(keys, 500).map(async (allIndexesInSlice) => {
            for (let i = 0; i < allIndexesInSlice.length; i++) {
              // Save frequently.
              if (i % 100 == 0) saveCache(cacheName, env, cacheContent);

              const key = allIndexesInSlice[i];
              setMessage(`Looking at key ${key}`);

              const thisSlice = candyMachine!.data.slice(
                CONFIG_ARRAY_START_V2 + 4 + CONFIG_LINE_SIZE_V2 * key,
                CONFIG_ARRAY_START_V2 + 4 + CONFIG_LINE_SIZE_V2 * (key + 1)
              );

              const name = fromUTF8Array([
                ...thisSlice.slice(4, 36).filter((n) => n !== 0),
              ]);
              const uri = fromUTF8Array([
                ...thisSlice.slice(40, 240).filter((n) => n !== 0),
              ]);
              const cacheItem = cacheContent.items[key];

              if (name != cacheItem.name || uri != cacheItem.link) {
                setError({
                  error: true,
                  message:
                    `Name (${name}) or uri (${uri}) didnt match cache values of (${cacheItem.name})` +
                    `and (${cacheItem.link}). marking to rerun for image ${key}`,
                });
                cacheItem.onChain = false;
                allGood = false;
              } else {
                cacheItem.verifyRun = true;
              }
            }
          })
        );

        if (!allGood) {
          saveCache(cacheName, env, cacheContent);

          throw new Error(
            `not all NFTs checked out. check out logs below for details`
          );
        }

        const lineCount = new BN(
          candyMachine!.data.slice(
            CONFIG_ARRAY_START_V2,
            CONFIG_ARRAY_START_V2 + 4
          ),
          undefined,
          'le'
        );
        setMessage(
          `uploaded (${lineCount.toNumber()}) out of (${
            candyMachineObj.data.itemsAvailable
          })`
        );

        console.log(
          `uploaded (${lineCount.toNumber()}) out of (${
            candyMachineObj.data.itemsAvailable
          })`
        );
        if (candyMachineObj.data.itemsAvailable > lineCount.toNumber()) {
          throw new Error(
            `predefined number of NFTs (${
              candyMachineObj.data.itemsAvailable
            }) is smaller than the uploaded one (${lineCount.toNumber()})`
          );
        } else {
          console.log('ready to deploy!');
        }

        saveCache(cacheName, env, cacheContent);
        setLoading(false);
      } catch (err) {
        console.error(err);
        saveCache(cacheName, env, cacheContent);

        setLoading(false);
        setError({ error: true, message: (err as Error).message });
      }
    }
  }

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
            href={`https://solscan.io/account/${account}?cluster=devnet`}
          >
            View in Solscan
          </a>
        </span>
        <>
          <label htmlFor='cache'>Cache file</label>

          <input type='file' name='cache' onChange={uploadCache} />
        </>
        <button
          className='bg-slate-500 w-fit p-4 rounded-2xl mt-6 text-white'
          onClick={() => verifyCandyMachine({ account, connection })}
        >
          {loading && !error.error && <span>...</span>}
          {!loading && !error.error && <span>Verify CM</span>}
          {!loading && error.error && <span>{message}</span>}
        </button>
        {loading && !error.error && (
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
