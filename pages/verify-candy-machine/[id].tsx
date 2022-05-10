import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
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

const CANDY_MACHINE_PROGRAM = new PublicKey(
  'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ'
);

type Account = string | string[] | undefined;

export function chunks(array: any, size: number) {
  return Array.apply(0, new Array(Math.ceil(array.length / size))).map(
    (_, index) => array.slice(index * size, (index + 1) * size)
  );
}

export function fromUTF8Array(data: number[]) {
  // array of bytes
  let str = '',
    i;

  for (i = 0; i < data.length; i++) {
    const value = data[i];

    if (value < 0x80) {
      str += String.fromCharCode(value);
    } else if (value > 0xbf && value < 0xe0) {
      str += String.fromCharCode(((value & 0x1f) << 6) | (data[i + 1] & 0x3f));
      i += 1;
    } else if (value > 0xdf && value < 0xf0) {
      str += String.fromCharCode(
        ((value & 0x0f) << 12) |
          ((data[i + 1] & 0x3f) << 6) |
          (data[i + 2] & 0x3f)
      );
      i += 2;
    } else {
      // surrogate pair
      const charCode =
        (((value & 0x07) << 18) |
          ((data[i + 1] & 0x3f) << 12) |
          ((data[i + 2] & 0x3f) << 6) |
          (data[i + 3] & 0x3f)) -
        0x010000;

      str += String.fromCharCode(
        (charCode >> 10) | 0xd800,
        (charCode & 0x03ff) | 0xdc00
      );
      i += 3;
    }
  }

  return str;
}

const CandyMachine: NextPage = () => {
  const router = useRouter();
  const account = router.query.id;
  const { cache, uploadCache } = useUploadCache();

  const anchorWallet = useAnchorWallet();

  const [loading, setLoading] = useState({ loading: false, error: false });

  async function fetchCandyMachine({
    account,
    connection,
  }: {
    account: Account;
    connection: Connection;
  }) {
    if (account && anchorWallet) {
      try {
        setLoading({ loading: true, error: false });
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

        const cacheContent = JSON.parse(await cache.text());

        const keys = Object.keys(cacheContent.items)
          .filter((k) => !cacheContent.items[k].verifyRun)
          .sort((a, b) => Number(a) - Number(b));

        if (keys.length > 0) {
          console.log(
            `Checking ${keys.length} items that have yet to be checked...`
          );
        }

        await Promise.all(
          chunks(keys, 500).map(async (allIndexesInSlice) => {
            for (let i = 0; i < allIndexesInSlice.length; i++) {
              // Save frequently.
              if (i % 100 == 0) saveCache(cacheName, env, cacheContent);

              const key = allIndexesInSlice[i];
              console.log('Looking at key ', key);

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
                console.log(
                  `Name (${name}) or uri (${uri}) didnt match cache values of (${cacheItem.name})` +
                    `and (${cacheItem.link}). marking to rerun for image`,
                  key
                );
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
            `not all NFTs checked out. check out logs above for details`
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
        setLoading({ loading: false, error: false });
      } catch (err) {
        console.error(err);
        setLoading({ loading: false, error: true });
      }
    }
  }

  //   useEffect(() => {
  //     fetchCandyMachine({ account, connection }).then(setCandyMachineConfig);
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [account, connection, anchorWallet]);

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
      </div>
    </>
  );
};

export default CandyMachine;
