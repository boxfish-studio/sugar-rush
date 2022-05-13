import { useAnchorWallet, AnchorWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { useRPC } from 'hooks';
import { loadCandyProgramV2 } from 'lib/candy-machine/upload/config';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { sendTransactionWithRetryWithKeypair } from 'lib/candy-machine/upload/transactions';

const useRemoveCandyMachineAccount = () => {
  const anchorWallet = useAnchorWallet();
  const { rpcEndpoint } = useRPC();

  const removeAccount = async (account: string) => {
    if (!anchorWallet) return;
    const provider = new AnchorProvider(rpcEndpoint, anchorWallet, {
      preflightCommitment: 'recent',
    });

    const anchorProgram = await loadCandyProgramV2(provider);

    async function withdrawV2(
      anchorProgram: Program,
      keypair: AnchorWallet,
      candyAddress: PublicKey
    ): Promise<string> {
      const instructions: TransactionInstruction[] = [
        await anchorProgram.methods
          .withdrawFunds()
          .accounts({
            candyMachine: candyAddress,
            authority: keypair.publicKey,
          })
          .instruction(),
      ];
      return (
        await sendTransactionWithRetryWithKeypair(
          anchorProgram.provider.connection,
          anchorWallet!,
          instructions,
          'confirmed'
        )
      ).txid;
    }

    return await withdrawV2(
      anchorProgram,
      anchorWallet,
      new PublicKey(account)
    );
  };

  return {
    removeAccount,
  };
};

export default useRemoveCandyMachineAccount;
