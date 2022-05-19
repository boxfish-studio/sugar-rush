import React, { FC, useState } from 'react'
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import { useForm, useUploadFiles, useRPC, useUploadCache } from 'hooks'
import {
  getCandyMachineV2Config,
  verifyAssets,
  loadCandyProgramV2,
} from 'lib/upload/config'
import {
  CandyMachineConfig,
  Gatekeeper,
  FetchedCandyMachineConfig,
} from 'lib/interfaces'
import { StorageType } from 'lib/enums'
import {
  parseDateToUTC,
  parseDateFromDateBN,
  parseTimeFromDateBN,
  getCurrentDate,
  getCurrentTime,
} from 'lib/utils'
import { uploadV2 } from 'lib/upload/upload'
import { AnchorProvider, BN } from '@project-serum/anchor'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { updateV2 } from 'lib/update/update'
import { ActionButton, CheckConnectedWallet } from 'components/Layout'

const Form: FC<{
  fetchedValues?: FetchedCandyMachineConfig
  updateCandyMachine?: boolean
  candyMachinePubkey?: string | string[]
}> = ({ fetchedValues, updateCandyMachine, candyMachinePubkey }) => {
  const { publicKey } = useWallet()
  const anchorWallet = useAnchorWallet()
  const { rpcEndpoint } = useRPC()

  const { files, uploadAssets } = useUploadFiles()
  const { cache, uploadCache } = useUploadCache()
  const [isInteractingWithCM, setIsInteractingWithCM] = useState(false)
  const [status, setStatus] = useState('')

  const initialState = {
    price: fetchedValues?.price
      ? new BN(fetchedValues?.price).toNumber() / LAMPORTS_PER_SOL
      : 0,
    'number-of-nfts': 0,
    'treasury-account': fetchedValues?.solTreasuryAccount?.toBase58() ?? '',
    captcha: fetchedValues?.gatekeeper ?? false,
    mutable: fetchedValues?.isMutable ?? false,
    'date-mint': fetchedValues?.goLiveDate
      ? parseDateFromDateBN(fetchedValues?.goLiveDate)
      : getCurrentDate(),
    'time-mint': fetchedValues?.goLiveDate
      ? parseTimeFromDateBN(fetchedValues?.goLiveDate)
      : getCurrentTime(),

    storage: '',
    files: [],
    cache: null,
    'new-authority': '',
  } as const

  const { onChange, onSubmit, values } = useForm(
    updateCandyMachine ? updateCandyMachineV2 : createCandyMachineV2,
    initialState
  )

  function isFormValid(): boolean {
    // TODO add more conditions
    // TODO add custom message to show error message
    if (files.length === 0) return false
    if (files.length % 2 != 0) return false
    if (values['number-of-nfts'] * 2 != files.length) return false
    if (!values['date-mint'] || !values['time-mint']) return false
    if (values.price == 0 || isNaN(values.price)) return false
    if (values['number-of-nfts'] == 0 || isNaN(values['number-of-nfts']))
      return false

    return true
  }
  async function createCandyMachineV2() {
    if (!isFormValid()) return
    setIsInteractingWithCM(true)
    setStatus('')
    let candyMachine: string = ''
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
      noMutable: !values.mutable,
      arweaveJwk: null,
      batchSize: null,
      pinataGateway: null,
      pinataJwt: null,
      uuid: null,
    }

    if (publicKey && anchorWallet) {
      const { supportedFiles, elemCount } = verifyAssets(
        files,
        config.storage,
        config.number
      )

      const provider = new AnchorProvider(rpcEndpoint, anchorWallet, {
        preflightCommitment: 'recent',
      })

      const anchorProgram = await loadCandyProgramV2(provider)

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
      } = await getCandyMachineV2Config(publicKey, config, anchorProgram)

      const startMilliseconds = Date.now()

      console.log('started at: ' + startMilliseconds.toString())
      try {
        const _candyMachine = await uploadV2({
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
        })

        if (typeof _candyMachine === 'string') candyMachine = _candyMachine
      } catch (err) {
        console.error('upload was not successful, please re-run.', err)
        setIsInteractingWithCM(false)
        setStatus('upload was not successful, please re-run.')
      }
      const endMilliseconds = Date.now()
      console.log(endMilliseconds.toString())

      setIsInteractingWithCM(false)
      setStatus(`Candy Machine created successfully! ${candyMachine}`)
    }
  }

  function isFormUpdateValid(): boolean {
    // TODO add more conditions
    // TODO add custom message to show error message
    if (!values['date-mint'] || !values['time-mint']) return false
    if (values.price === 0 || isNaN(values.price)) return false

    return true
  }

  async function updateCandyMachineV2() {
    try {
      if (!isFormUpdateValid()) return
      setIsInteractingWithCM(true)
      setStatus('')

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
        noMutable: !values.mutable,
        arweaveJwk: null,
        batchSize: null,
        pinataGateway: null,
        pinataJwt: null,
        uuid: null,
      }

      if (publicKey && anchorWallet && candyMachinePubkey) {
        const provider = new AnchorProvider(rpcEndpoint, anchorWallet, {
          preflightCommitment: 'recent',
        })

        const anchorProgram = await loadCandyProgramV2(provider)

        const candyMachineObj: any =
          await anchorProgram.account.candyMachine.fetch(
            new PublicKey(candyMachinePubkey)
          )

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
        } = await getCandyMachineV2Config(publicKey, config, anchorProgram)

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
            }
          }),
        }

        await updateV2({
          newSettings,
          candyMachinePubkey,
          publicKey,
          treasuryWallet,
          anchorProgram,
          cache: await cache.text(),
          newAuthority: values['new-authority'],
        })
        setIsInteractingWithCM(false)
        setStatus('Candy Machine updated successfully!')
      }
    } catch (err) {
      setIsInteractingWithCM(false)
      setStatus('Candy Machine update was not successful, please re-run.')
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
                ? fetchedValues?.solTreasuryAccount?.toBase58()
                : publicKey?.toBase58()
            }
          />
        )}

        <FormInput
          id='captcha'
          text='Captcha?'
          type='checkbox'
          onChange={onChange}
          defaultChecked={fetchedValues?.gatekeeper ?? false}
        />

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
          defaultValue={
            fetchedValues?.goLiveDate
              ? parseDateFromDateBN(fetchedValues?.goLiveDate)
              : getCurrentDate()
          }
        />
        <FormInput
          id='time-mint'
          text='Time for mint (GMT)'
          type='time'
          onChange={onChange}
          defaultValue={
            fetchedValues?.goLiveDate
              ? parseTimeFromDateBN(fetchedValues?.goLiveDate)
              : getCurrentTime()
          }
        />
        {updateCandyMachine && (
          // No default value since it is dangerous to transfer the authority of the CM to another account.
          <FormInput
            id='new-authority'
            text='New Authority'
            type='text'
            onChange={onChange}
          />
        )}
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
        {updateCandyMachine && (
          <>
            <label htmlFor='cache'>Cache file</label>

            <input type='file' name='cache' onChange={uploadCache} />
          </>
        )}

        {updateCandyMachine && !isInteractingWithCM && (
          <ActionButton text='Update Candy Machine' type='submit' />
        )}
        {!updateCandyMachine && !isInteractingWithCM && (
          <ActionButton text='Create Candy Machine' type='submit' />
        )}

        {updateCandyMachine && isInteractingWithCM && (
          <ActionButton text='Updating Candy Machine...' isLoading />
        )}
        {!updateCandyMachine && isInteractingWithCM && (
          <>
            <ActionButton text='Creating Candy Machine...' isLoading />
            <span
              className='w-[30rem] font-bold
            text-red-500 my-3'
            >
              IMPORTANT! Make sure to save the Cache file that will be
              downloaded at the end! Without it, you will not be able to update
              your Candy Machine.
            </span>
          </>
        )}
        {!isInteractingWithCM && status && (
          <span className='font-bold text-xl my-4 w-[30rem] '>{status}</span>
        )}
      </div>
    </form>
  )
}

interface Input {
  id: string
  text: string
  type: string
  defaultValue?: string | number
  defaultChecked?: boolean
  value?: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
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
        step='any'
        name={id}
        defaultValue={defaultValue}
        defaultChecked={defaultChecked}
        value={value}
        onChange={onChange}
      />
    </>
  )
}

export default Form
