import { AnchorProvider, BN } from '@project-serum/anchor'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useForm, useRPC, useUploadCache, useUploadFiles } from 'hooks'
import { DEFAULT_GATEKEEPER } from 'lib/candy-machine/constants'
import { StorageType } from 'lib/candy-machine/enums'
import { ICandyMachineConfig, IFetchedCandyMachineConfig } from 'lib/candy-machine/interfaces'
import { getCandyMachineV2Config, loadCandyProgramV2, verifyAssets } from 'lib/candy-machine/upload/config'
import { uploadV2 } from 'lib/candy-machine/upload/upload'
import { getCurrentDate, getCurrentTime, parseDateFromDateBN, parseDateToUTC, parseTimeFromDateBN } from 'lib/utils'
import React, { FC, useState } from 'react'
import { Box, Button, Spinner, StyledOcticon } from '@primer/react'
import { AlertIcon } from '@primer/octicons-react'

const CreateCandyMachine: FC<{
    fetchedValues?: IFetchedCandyMachineConfig
    candyMachinePubkey?: string | string[]
}> = ({ fetchedValues, candyMachinePubkey }) => {
    const { publicKey } = useWallet()
    const anchorWallet = useAnchorWallet()
    const { rpcEndpoint } = useRPC()

    const { files, uploadAssets } = useUploadFiles()
    const { cache, uploadCache } = useUploadCache()
    const [isInteractingWithCM, setIsInteractingWithCM] = useState(false)
    const [status, setStatus] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const initialState = {
        price: fetchedValues?.price ? new BN(fetchedValues?.price).toNumber() / LAMPORTS_PER_SOL : 0,
        'number-of-nfts': 0,
        'treasury-account': fetchedValues?.solTreasuryAccount?.toBase58() ?? '',
        captcha: fetchedValues?.gatekeeper ?? false,
        mutable: fetchedValues?.isMutable ?? false,
        'date-mint': fetchedValues?.goLiveDate ? parseDateFromDateBN(fetchedValues?.goLiveDate) : getCurrentDate(),
        'time-mint': fetchedValues?.goLiveDate ? parseTimeFromDateBN(fetchedValues?.goLiveDate) : getCurrentTime(),

        storage: '',
        files: [],
        cache: null,
        'new-authority': '',
    } as const

    const { onChange, onSubmit, values } = useForm(createCandyMachineV2, initialState)

    function isFormValid(): boolean {
        // TODO add more conditions
        // TODO add custom message to show error message

        if (files.length === 0) {
            setErrorMessage('There are no files to upload')
            return false
        }
        if (files.length % 2 != 0) {
            setErrorMessage('You have to upload 2 files per NFT')
            return false
        }
        if (values['number-of-nfts'] * 2 != files.length) {
            setErrorMessage('Does not match the number of nfts')
            return false
        }
        let isZeroJsonFile: boolean = files.filter((e) => e.name === '0.json').length === 0 ? false : true
        if (!isZeroJsonFile) {
            setErrorMessage('The 0.json file must exist in Files')
            return false
        }
        if (values.price == 0 || isNaN(values.price)) {
            setErrorMessage('The Price of each NFT cannot be 0')
            return false
        }
        if (values['number-of-nfts'] == 0 || isNaN(values['number-of-nfts'])) {
            setErrorMessage('The Number of NFTs cannot be 0')
            return false
        }

        setErrorMessage('')
        return true
    }
    async function createCandyMachineV2() {
        if (!isFormValid()) return
        setIsInteractingWithCM(true)
        setStatus('')
        let candyMachine: string = ''
        const config: ICandyMachineConfig = {
            price: values.price,
            number: values['number-of-nfts'],
            gatekeeper: values.captcha ? DEFAULT_GATEKEEPER : null,
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
            const { supportedFiles, elemCount } = verifyAssets(files, config.storage, config.number)

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

    return (
        <form onSubmit={onSubmit}>
            <div className='d-flex flex-column flex-justify-between'>
                <Box
                    className='overflow-y-scroll d-flex flex-column pb-4 height-full'
                    sx={{ maxHeight: ['380px', '550px'], marginBottom: ['16px', '32px'] }}
                >
                    <FormInput
                        id='price'
                        text='Price of each NFT (SOL)'
                        type='number'
                        onChange={onChange}
                        defaultValue={
                            fetchedValues?.price ? new BN(fetchedValues.price).toNumber() / LAMPORTS_PER_SOL : undefined
                        }
                        required
                    />

                    <FormInput
                        id='number-of-nfts'
                        text='Number of NFTs'
                        type='number'
                        onChange={onChange}
                        defaultValue={
                            fetchedValues?.itemsAvailable ? new BN(fetchedValues.itemsAvailable).toNumber() : undefined
                        }
                        required
                    />

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
                        required
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
                        required
                    />
                    <div className='select-wrapper d-flex flex-column'>
                        <label htmlFor='storage' className='my-3'>
                            Storage client
                        </label>
                        <select
                            name='storage'
                            id='storage'
                            className='mb-4 px-2 py-2 rounded-2 cursor-pointer'
                            style={{ border: '1px solid #1b1f2426' }}
                        >
                            <option value='' disabled selected>
                                Choose an option
                            </option>
                            {Object.keys(StorageType)
                                .filter((key) => key === 'Arweave')
                                .map((key) => (
                                    <option key={key} value={key}>
                                        {key}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <label
                        htmlFor='file'
                        className='my-4 px-4 py-2 rounded-2 cursor-pointer'
                        style={{ border: '1px solid #1b1f2426' }}
                    >
                        Upload file
                    </label>
                    <input
                        id='file'
                        type='file'
                        name='files'
                        multiple
                        onChange={uploadAssets}
                        className='d-none'
                        required
                    />

                    {errorMessage.length > 0 && (
                        <span className='color-fg-closed color-bg-closed border color-border-closed-emphasis mt-3 p-3 rounded-2'>
                            <StyledOcticon icon={AlertIcon} size={16} color='danger.fg' sx={{ marginRight: '6px' }} />{' '}
                            {errorMessage}
                        </span>
                    )}
                </Box>

                {!isInteractingWithCM && (
                    <Button variant='primary' size='large' type='submit'>
                        Create candy machine
                    </Button>
                )}
                {isInteractingWithCM && (
                    <>
                        <Button isLoading disabled size='large'>
                            Creating Candy Machine... <Spinner size='small' />
                        </Button>
                        <span className='color-fg-accent text-center mt-6 w-full my-3'>
                            IMPORTANT! Make sure to save the Cache file that will be downloaded at the end! Without it,
                            you will not be able to update your Candy Machine.
                        </span>
                    </>
                )}
                {!isInteractingWithCM && status && <span className='font-medium text-xl mt-6 mb-4'>{status}</span>}
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
    required?: boolean
    value?: string | number
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const FormInput: FC<Input> = ({ id, text, type, defaultValue, defaultChecked, value, required, onChange }) => {
    return (
        <div className={`d-flex ${type === 'checkbox' ? 'flex-row' : 'flex-column'}`}>
            <label htmlFor={id} className={`my-3 font-medium `}>
                {text}
            </label>
            <input
                style={{ border: '1px solid #1b1f2426' }}
                className={`w-full p-2 rounded-2 ${type === 'checkbox' ? 'ml-2' : 'ml-0'}`}
                id={id}
                type={type}
                step='any'
                name={id}
                defaultValue={defaultValue}
                defaultChecked={defaultChecked}
                value={value}
                required={required}
                onChange={onChange}
            />
        </div>
    )
}

export default CreateCandyMachine
