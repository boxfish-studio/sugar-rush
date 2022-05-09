import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState, Suspense } from 'react';
import { Program, AnchorProvider, BN } from '@project-serum/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Spinner } from 'components/Layout';
import Form from 'components/CreateCM/Form';
const CANDY_MACHINE_PROGRAM = new PublicKey(
  'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ'
);

type Account = string | string[] | undefined;

export interface FetchedCandyMachineConfig {
  creators: {
    address: PublicKey;
    share: 100;
    verified: true;
  }[];
  endSettings: null;
  gatekeeper: null;
  goLiveDate: BN;
  hiddenSettings: null;
  isMutable: true;
  itemsAvailable: BN;
  maxSupply: BN;
  price: BN;
  retainAuthority: boolean;
  sellerFeeBasisPoints: number;
  symbol: string;
  uuid: string;
  whitelistMintSettings: null;
  solTreasuryAccount: PublicKey;
}

const CandyMachine: NextPage = () => {
  const router = useRouter();
  const account = router.query.id;

  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [candyMachineConfig, setCandyMachineConfig] =
    useState<FetchedCandyMachineConfig>();

  async function fetchCandyMachine({
    account,
    connection,
  }: {
    account: Account;
    connection: Connection;
  }): Promise<FetchedCandyMachineConfig | undefined> {
    if (account && anchorWallet) {
      const provider = new AnchorProvider(connection, anchorWallet, {
        preflightCommitment: 'processed',
      });

      const idl = await Program.fetchIdl(CANDY_MACHINE_PROGRAM, provider);

      const program = new Program(idl!, CANDY_MACHINE_PROGRAM, provider);

      const state: any = await program.account.candyMachine.fetch(
        new PublicKey(account)
      );
      state.data.solTreasuryAccount = state.wallet;
      console.log('candyMachineConfig: ', state);
      console.log('x', new PublicKey( state.authority).toBase58());

      return state.data;
    }
  }

  useEffect(() => {
    fetchCandyMachine({ account, connection }).then(setCandyMachineConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, connection, anchorWallet]);

  if (account && connection && anchorWallet && candyMachineConfig?.uuid) {
    return (
      <Suspense fallback={<Spinner />}>
        <div>
          {account}
          <Form fetchedValues={candyMachineConfig} updateCandyMachine  candyMachinePubkey={account}/>
        </div>
      </Suspense>
    );
  } else {
    return (
      <div>
        {account}
        No cm config found
      </div>
    );
  }
};

export default CandyMachine;
