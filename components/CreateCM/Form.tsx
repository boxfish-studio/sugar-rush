import React, { FC, useState } from 'react';
import {
  useWallet,
  useAnchorWallet,
  useConnection,
} from '@solana/wallet-adapter-react';
import { useForm, useUploadFiles } from 'hooks';
import {
  getCandyMachineV2Config,
  verifyAssets,
  loadCandyProgramV2,
} from 'lib/candy-machine/upload/config';
import {
  CandyMachineConfig,
  Gatekeeper,
  StorageType,
} from 'lib/candy-machine/types';
import { parseDateToUTC, parseDateFromDateBN, parseTimeFromDateBN } from './utils';
import { uploadV2 } from 'lib/candy-machine/upload/upload';
import { AnchorProvider, BN } from '@project-serum/anchor';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { FetchedCandyMachineConfig } from 'pages/list-candy-machines/[id]';

const Form: FC<{
  fetchedValues: FetchedCandyMachineConfig;
  updateCandyMachine?: boolean;
  candyMachinePubkey?: string | string[];
}> = ({ fetchedValues, updateCandyMachine, candyMachinePubkey }) => {
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  const { files, uploadAssets } = useUploadFiles();

  function isFormValid(): boolean {
    // TODO add more conditions
    // TODO add custom message to show error message
    if (files.length === 0) return false;
    if (files.length % 2 != 0) return false;
    if (values['number-of-nfts'] * 2 != files.length) return false;
    if (!values['date-mint'] || !values['time-mint']) return false;
    if (values.price == 0 || isNaN(values.price)) return false;
    if (values['number-of-nfts'] == 0 || isNaN(values['number-of-nfts']))
      return false;

    return true;
  }

  const { onChange, onSubmit, values } = useForm(
    updateCandyMachine ? updateCandyMachineV2 : createCandyMachineV2,
    
  );

  async function createCandyMachineV2() {
    if (!isFormValid()) return;
    const config: CandyMachineConfig = {
      price: values.price,
      number: values['number-of-nfts'],
      gatekeeper: values.captcha ? Gatekeeper : null,
      solTreasuryAccount: values['treasury-account'],
      splTokenAccount: null,
      splToken: null,
      goLiveDate: parseDateToUTC(values['date-mint'], values['time-mint']),
      endSettings: null,
      whitelistMintSettings: null,
      hiddenSettings: null,
      storage: values.storage.toLowerCase() as StorageType,
      ipfsInfuraProjectId: null,
      ipfsInfuraSecret: null,
      nftStorageKey: null,
      awsS3Bucket: null,
      noRetainAuthority: false,
      noMutable: values.mutable,
      arweaveJwk: null,
      batchSize: null,
      pinataGateway: null,
      pinataJwt: null,
      uuid: null,
    };

    if (publicKey && anchorWallet) {
      const { supportedFiles, elemCount } = verifyAssets(
        files,
        config.storage,
        config.number
      );

      const provider = new AnchorProvider(connection, anchorWallet, {
        preflightCommitment: 'recent',
      });

      const anchorProgram = await loadCandyProgramV2(provider);

      const {
        storage,
        nftStorageKey,
        ipfsInfuraProjectId,
        number,
        ipfsInfuraSecret,
        pinataJwt,
        pinataGateway,
        arweaveJwk,
        awsS3Bucket,
        retainAuthority,
        mutable,
        batchSize,
        price,
        splToken,
        treasuryWallet,
        gatekeeper,
        endSettings,
        hiddenSettings,
        whitelistMintSettings,
        goLiveDate,
        uuid,
      } = await getCandyMachineV2Config(publicKey, config, anchorProgram);

      const startMs = Date.now();

      console.log('started at: ' + startMs.toString());
      try {
        await uploadV2({
          files: supportedFiles,
          cacheName: 'example',
          env: 'devnet',
          totalNFTs: elemCount,
          gatekeeper,
          storage,
          retainAuthority,
          mutable,
          // nftStorageKey,
          // ipfsCredentials:null,
          // pinataJwt,
          // pinataGateway,
          // awsS3Bucket,
          batchSize,
          price,
          treasuryWallet,
          anchorProgram,
          walletKeyPair: anchorWallet,
          // splToken,
          endSettings,
          hiddenSettings,
          whitelistMintSettings,
          goLiveDate,
          // uuid,
          // arweaveJwk,
          rateLimit: null,
          // collectionMintPubkey,
          // setCollectionMint,
          // rpcUrl,
        });
      } catch (err) {
        console.error('upload was not successful, please re-run.', err);
      }
      const endMs = Date.now();
      console.log(endMs.toString());
    }
  }

  function checkFormUpdateIsValid(): boolean {
    // TODO add more conditions
    // TODO add custom message to show error message
    if (!values['date-mint'] || !values['time-mint']) return false;
    if (values.price == 0 || isNaN(values.price)) return false;

    return true;
  }

  async function updateCandyMachineV2() {
    console.log('UPDATING');
    if (!checkFormUpdateIsValid()) return;

    const config: CandyMachineConfig = {
      price: values.price,
      number: values['number-of-nfts'],
      gatekeeper: values.captcha ? Gatekeeper : null,
      solTreasuryAccount: values['treasury-account'],
      splTokenAccount: null,
      splToken: null,
      goLiveDate: parseDateToUTC(values['date-mint'], values['time-mint']),
      endSettings: null,
      whitelistMintSettings: null,
      hiddenSettings: null,
      storage: values.storage.toLowerCase() as StorageType,
      ipfsInfuraProjectId: null,
      ipfsInfuraSecret: null,
      nftStorageKey: null,
      awsS3Bucket: null,
      noRetainAuthority: false,
      noMutable: values.mutable,
      arweaveJwk: null,
      batchSize: null,
      pinataGateway: null,
      pinataJwt: null,
      uuid: null,
    };

    if (publicKey && anchorWallet && candyMachinePubkey) {
      const provider = new AnchorProvider(connection, anchorWallet, {
        preflightCommitment: 'recent',
      });

      const anchorProgram = await loadCandyProgramV2(provider);

      const candyMachineObj: any =
        await anchorProgram.account.candyMachine.fetch(
          new PublicKey(candyMachinePubkey)
        );

      const {
        number,
        retainAuthority,
        mutable,
        price,
        splToken,
        treasuryWallet,
        gatekeeper,
        endSettings,
        hiddenSettings,
        whitelistMintSettings,
        goLiveDate,
        uuid,
      } = await getCandyMachineV2Config(publicKey, config, anchorProgram);

      const newSettings = {
        itemsAvailable: number
          ? new BN(number)
          : candyMachineObj.data.itemsAvailable,
        uuid: uuid || candyMachineObj.data.uuid,
        symbol: candyMachineObj.data.symbol,
        sellerFeeBasisPoints: candyMachineObj.data.sellerFeeBasisPoints,
        isMutable: mutable,
        maxSupply: new BN(0),
        retainAuthority: retainAuthority,
        gatekeeper,
        goLiveDate,
        endSettings,
        price,
        whitelistMintSettings,
        hiddenSettings,
        creators: candyMachineObj.data.creators.map((creator: any) => {
          return {
            address: new PublicKey(creator.address),
            verified: true,
            share: creator.share,
          };
        }),
      };
      const tx = await anchorProgram.methods
        .updateCandyMachine(newSettings)
        .accounts({
          candyMachine: new PublicKey(candyMachinePubkey),
          authority: publicKey,
          wallet: treasuryWallet,
        })
        .rpc();


      // remainingAccounts: cacheContent.startDate = goLiveDate;

      console.log('update_candy_machine finished', tx);

      // if (newAuthorityKey) {
      //   const tx = await anchorProgram.rpc.updateAuthority(newAuthorityKey, {
      //     accounts: {
      //       candyMachine,
      //       authority: walletKeyPair.publicKey,
      //       wallet: treasuryWallet,
      //     },
      //   });

      //   cacheContent.authority = newAuthorityKey.toBase58();
      //   log.info(` - updated authority: ${newAuthorityKey.toBase58()}`);
      //   log.info('update_authority finished', tx);
      // }

      // saveCache(cacheName, env, cacheContent);
    }
  }
  return (
    <form
      className='flex flex-col items-center h-auto justify-center mt-8'
      onSubmit={onSubmit}
    >
      <div className='flex flex-col p-4 xxl-shadow rounded-2xl scale-90 bg-gray-200 min-w-max items-center justify-center'>
        <FormInput
          id='price'
          text='Price of each NFT (SOL)'
          type='number'
          onChange={onChange}
          defaultValue={
            fetchedValues?.price
              ? new BN(fetchedValues.price).toNumber() / LAMPORTS_PER_SOL
              : undefined
          }
        />
        {!updateCandyMachine && (
          <FormInput
            id='number-of-nfts'
            text='Number of NFTs'
            type='number'
            onChange={onChange}
            defaultValue={
              fetchedValues?.itemsAvailable
                ? new BN(fetchedValues.itemsAvailable).toNumber()
                : undefined
            }
          />
        )}
        {updateCandyMachine && (
          <FormInput
            id='treasury-account'
            text='Treasury Account'
            type='text'
            onChange={onChange}
            defaultValue={
              updateCandyMachine
                ? fetchedValues.solTreasuryAccount?.toBase58()
                : publicKey?.toBase58()
            }
          />
        )}
        {!updateCandyMachine && (
          <FormInput
            id='captcha'
            text='Captcha?'
            type='checkbox'
            onChange={onChange}
          />
        )}
        <FormInput
          id='mutable'
          text='Mutable?'
          type='checkbox'
          onChange={onChange}
          defaultChecked={fetchedValues?.isMutable}
        />
        <FormInput
          id='date-mint'
          text='Date for mint'
          type='date'
          onChange={onChange}
          defaultValue={parseDateFromDateBN(fetchedValues?.goLiveDate)}
        />
        <FormInput
          id='time-mint'
          text='Time for mint (GMT)'
          type='time'
          onChange={onChange}
          defaultValue={parseTimeFromDateBN(fetchedValues?.goLiveDate)}
        />
        {!updateCandyMachine && (
          <>
            <label htmlFor='storage'>Storage</label>
            <input list='storage' name='storage' className='w-[40rem]' />
            <datalist id='storage' defaultValue='Arweave'>
              {Object.keys(StorageType)
                .filter((key) => key === 'Arweave')
                .map((key) => (
                  <option key={key} value={key} />
                ))}
            </datalist>

            <label htmlFor='files'>Files</label>

            <input type='file' name='files' multiple onChange={uploadAssets} />
          </>
        )}
        <button
          type='submit'
          className='bg-slate-500 w-fit p-4 rounded-2xl mt-6 text-white'
        >
          {updateCandyMachine ? 'Update Candy Machine' : 'Create Candy Machine'}
        </button>
      </div>
    </form>
  );
};

interface Input {
  id: string;
  text: string;
  type: string;
  defaultValue?: string | number;
  defaultChecked?: boolean;
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormInput: FC<Input> = ({
  id,
  text,
  type,
  defaultValue,
  defaultChecked,
  value,
  onChange,
}) => {
  return (
    <>
      <label htmlFor={id}>{text}</label>
      <input
        className='w-[40rem]'
        id={id}
        type={type}
        name={id}
        defaultValue={defaultValue}
        defaultChecked={defaultChecked}
        value={value}
        onChange={onChange}
      />
    </>
  );
};

export default Form;
