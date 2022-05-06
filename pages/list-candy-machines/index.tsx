/* eslint-disable react-hooks/exhaustive-deps */
import type { NextPage } from 'next';
import Head from 'next/head';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';
import CandyMachineCard from 'components/FetchCM/CandyMachineCard';
import React, { useEffect, useState } from 'react';

const API_DEVNET = 'https://api.devnet.solana.com';
const RPC_API_DEVNET = 'https://explorer-api.devnet.solana.com/';
const CANDY_MACHINE_PROGRAM_V2_ID = new PublicKey(
  'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ'
);

const ListCandyMachines: NextPage = () => {
  const { publicKey } = useWallet();

  const { connection } = useConnection();
  const [accounts, setAccounts] = useState<string[]>([]);

  // the endpoint provided by useConnection is wrong, so we need to use the RPC_API_DEVNET if we are on devnet.
  const rpcEndpoint =
    connection.rpcEndpoint === API_DEVNET
      ? new Connection(RPC_API_DEVNET)
      : connection;

  async function fetchAccounts() {
    if (publicKey) {
      const accounts = await rpcEndpoint.getParsedProgramAccounts(
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
      );
      const accountsPubkeys = accounts.map((account) =>
        account.pubkey.toBase58()
      );
      setAccounts(accountsPubkeys);
    }
  }

  useEffect(() => {
    fetchAccounts();
  }, [publicKey]);

  return (
    <>
      <Head>
        <title>List Candy Machine</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      List Candy Machine
      <div className='grid lg:grid-cols-2 gap-y-3 mt-6 grid-flow-row grid-cols-1'>
        {accounts.length > 0 ? (
          accounts.map((account) => (
            <CandyMachineCard key={account} account={account} />
          ))
        ) : (
          <div>No Candy Machines</div>
        )}
      </div>
    </>
  );
};

export default ListCandyMachines;
