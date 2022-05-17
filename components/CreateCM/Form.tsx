import React, { FC, useState } from 'react';
import {
  useConnection,
  useAnchorWallet,
  useWallet,
} from '@solana/wallet-adapter-react';
import { useForm } from 'hooks';
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
import { parseDateToUTC } from './utils';
import { uploadV2 } from 'lib/candy-machine/upload/upload';
import { AnchorProvider } from '@project-serum/anchor';

const Form: FC = () => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const { publicKey, connected } = useWallet(); 

  const [files, setFiles] = useState<File[]>([]);

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

  function uploadAssets(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length == 0) {
      window.alert('No files uploaded');
      return;
    }
    const fileList = new Array<File>();
    Array.from(e.target.files).forEach((file) => {
      fileList.push(file);
    });
    setFiles(fileList);
  }

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

      const startMilliseconds = Date.now();

      console.log('started at: ' + startMilliseconds.toString());
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
      const endMilliseconds = Date.now();
      console.log(endMilliseconds.toString());
    }
  }

  const initialState = {
    price: 0,
    'number-of-nfts': 0,
    'treasury-account': '',
    captcha: false,
    mutable: false,
    'date-mint': '',
    'time-mint': '',
    storage: '',
    files: [],
  } as const;

  const { onChange, onSubmit, values } = useForm(
    createCandyMachineV2,
    initialState
  );

  if (!connected) {
    return (
      <h1 className='text-red-600 text-xl flex flex-col items-center h-auto justify-center mt-8'>
      Connect your wallet to create a Candy Machine
      </h1>
    )
  }

  return (
    <form
      className='flex flex-col items-center h-auto justify-center mt-8'
      onSubmit={onSubmit}
    >
      <div className='flex flex-col p-4 xxl-shadow rounded-2xl scale-90 bg-gray-200 min-w-max items-center justify-center'>
        <FormInput
          id='price'
          text='Price of each NFT'
          type='number'
          onChange={onChange}
        />
        <FormInput
          id='number-of-nfts'
          text='Number of NFTs'
          type='number'
          onChange={onChange}
        />
        <FormInput
          id='treasury-account'
          text='Treasury Account'
          type='text'
          onChange={onChange}
          defaultValue={publicKey?.toBase58()}
        />
        <FormInput
          id='captcha'
          text='Captcha?'
          type='checkbox'
          onChange={onChange}
        />
        <FormInput
          id='mutable'
          text='Mutable?'
          type='checkbox'
          onChange={onChange}
        />
        <FormInput
          id='date-mint'
          text='Date for mint'
          type='date'
          onChange={onChange}
        />
        <FormInput
          id='time-mint'
          text='Time for mint'
          type='time'
          onChange={onChange}
        />
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
        <button
          type='submit'
          className='bg-slate-500 w-fit p-4 rounded-2xl mt-6 text-white'
        >
          Create Candy Machine
        </button>
      </div>
    </form>
  );
};

interface Input {
  id: string;
  text: string;
  type: string;
  defaultValue?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormInput: FC<Input> = ({
  id,
  text,
  type,
  defaultValue,
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
        value={value}
        onChange={onChange}
      />
    </>
  );
};

export default Form;
