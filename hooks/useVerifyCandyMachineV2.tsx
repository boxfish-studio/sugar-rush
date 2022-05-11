import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { Account } from 'lib/candy-machine/types';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@project-serum/anchor';
import { CANDY_MACHINE_PROGRAM_V2_ID } from 'lib/candy-machine/constants';
import { chunks, fromUTF8Array } from 'lib/candy-machine/verify/helpers';
import { saveCache } from 'lib/candy-machine/cache';

import {
  CONFIG_ARRAY_START_V2,
  CONFIG_LINE_SIZE_V2,
} from 'lib/candy-machine/constants';

const useVerifyCandyMachineV2 = (cache: File) => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const [error, setError] = useState({ error: false, message: '' });
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);

  async function verifyCandyMachine({ account }: { account: Account }) {
    if (account && anchorWallet && cache) {
      const cacheContent = JSON.parse(await cache.text());
      const cacheName = cacheContent.cacheName;
      const env = cacheContent.env;
      setMessage('');
      setError({ error: false, message: '' });
      setLoading(false);
      let errorMessage = '';
      try {
        setLoading(true);
        const provider = new AnchorProvider(connection, anchorWallet, {
          preflightCommitment: 'processed',
        });

        const idl = await Program.fetchIdl(
          CANDY_MACHINE_PROGRAM_V2_ID,
          provider
        );

        const program = new Program(
          idl!,
          CANDY_MACHINE_PROGRAM_V2_ID,
          provider
        );

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
                (errorMessage =
                  `Name (${name}) or uri (${uri}) didnt match cache values of (${cacheItem.name})` +
                  `and (${cacheItem.link}). marking to rerun for image ${key}`),
                  (cacheItem.onChain = false);
                allGood = false;
              } else {
                cacheItem.verifyRun = true;
              }
            }
          })
        );

        if (!allGood) {
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
          `Uploaded ${lineCount.toNumber()}/${
            candyMachineObj.data.itemsAvailable
          }`
        );

        if (candyMachineObj.data.itemsAvailable > lineCount.toNumber()) {
          throw new Error(
            `predefined number of NFTs (${
              candyMachineObj.data.itemsAvailable
            }) is smaller than the uploaded one (${lineCount.toNumber()})`
          );
        } else {
          setMessage('All assets are verified. Ready to deploy!');
        }
        saveCache(cacheName, env, cacheContent);
        setLoading(false);
      } catch (err) {
        console.error(err);
        saveCache(cacheName, env, cacheContent);
        setLoading(false);
        setError({
          error: true,
          message: errorMessage || (err as Error).message,
        });
      }
    }
  }

  return {
    loading,
    error,
    verifyCandyMachine,
    message,
    connection,
  };
};

export default useVerifyCandyMachineV2;
