import { AnchorProvider, BN } from '@project-serum/anchor'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { useForm, useRPC, useUploadCache, useUploadFiles, useNotification } from 'hooks'
import { Connection } from '@solana/web3.js'
import { DEFAULT_GATEKEEPER } from 'lib/candy-machine/constants'
import { StorageType } from 'lib/candy-machine/enums'
import { ICandyMachineConfig } from 'lib/candy-machine/interfaces'
import { getCandyMachineV2Config, loadCandyProgramV2, verifyAssets } from 'lib/candy-machine/upload/config'
import { uploadV2 } from 'lib/candy-machine/upload/upload'
import { getCurrentDate, getCurrentTime, parseDateToUTC } from 'lib/utils'
import React, { FC, useState, useEffect } from 'react'
import { Box, Button, Spinner } from '@primer/react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { NotificationType } from 'lib/interfaces'

const CreateCandyMachine: FC = () => {
    const { publicKey } = useWallet()
    const anchorWallet = useAnchorWallet()
    const { connection, network } = useRPC()
    const { addNotification } = useNotification()

    const { files, uploadAssets } = useUploadFiles()
    const [isInteractingWithCM, setIsInteractingWithCM] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const initialState = {
        price: 0,
        'number-of-nfts': 0,
        'treasury-account': '',
        captcha: false,
        mutable: false,
        'date-mint': getCurrentDate(),
        'time-mint': getCurrentTime(),
        storage: '',
        files: [],
        cache: null,
    } as const

    const { onChange, onSubmit, values } = useForm(createCandyMachineV2, initialState)

    function isFormValid(): boolean {
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
        if (!connection) {
            setErrorMessage('Select network first')
            return
        }
        if (!isFormValid()) return
        setIsInteractingWithCM(true)
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

        if (publicKey && anchorWallet && connection && network) {
            const { supportedFiles, elemCount } = verifyAssets(files, config.storage, config.number)
            const provider = new AnchorProvider(new Connection(connection.rpcEndpoint), anchorWallet, {
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
                    env: WalletAdapterNetwork[network] as Exclude<WalletAdapterNetwork, WalletAdapterNetwork.Testnet>,
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
                addNotification({
                    message: `Candy Machine created successfully! ${candyMachine}`,
                    type: NotificationType.Success,
                })
            } catch (err) {
                addNotification({
                    message: `An error occurred while creating the Candy Machine`,
                    type: NotificationType.Error,
                })
            }
            const endMilliseconds = Date.now()
            console.log(endMilliseconds.toString())

            setIsInteractingWithCM(false)
        }
    }
    useEffect(() => {
        const button = document.getElementById('create-candy-machine-button')
        const scrollAfterSubmit = () => {
            const form = document.getElementById('form-container')
            form?.scroll({ top: 0, behavior: 'smooth' })
        }
        button?.addEventListener('click', scrollAfterSubmit)
        return () => {
            button?.removeEventListener('click', scrollAfterSubmit)
        }
    }, [])

    return (
        <form onSubmit={onSubmit} noValidate>
            <div className='d-flex flex-column flex-justify-between'>
                <Box
                    id='form-container'
                    className='overflow-y-scroll d-flex flex-column pb-4 height-full'
                    sx={{ maxHeight: ['380px', '550px'] }}
                >
                    {isInteractingWithCM && (
                        <span className='color-fg-accent color-bg-accent border color-border-accent rounded-2 mt-4 p-3'>
                            IMPORTANT! Make sure to save the Cache file that will be downloaded at the end! Without it,
                            you will not be able to update your Candy Machine.
                        </span>
                    )}
                    {isInteractingWithCM && (
                        <span className='color-fg-attention color-bg-severe border color-border-attention-emphasis rounded-2 mt-4 p-3'>
                            After creating the candy machine, it is recommended to click the refresh button
                        </span>
                    )}
                    <FormInput id='price' text='Price of each NFT (SOL) *' type='number' onChange={onChange} required />

                    <FormInput id='number-of-nfts' text='Number of NFTs *' type='number' onChange={onChange} required />

                    <FormInput id='captcha' text='Captcha?' type='checkbox' onChange={onChange} />

                    <FormInput id='mutable' text='Mutable?' type='checkbox' onChange={onChange} />
                    <FormInput
                        id='date-mint'
                        text='Mint date *'
                        type='date'
                        onChange={onChange}
                        defaultValue={getCurrentDate()}
                        required
                    />
                    <FormInput
                        id='time-mint'
                        text='Mint time *'
                        type='time'
                        onChange={onChange}
                        defaultValue={getCurrentTime()}
                        required
                    />
                    <div className='select-wrapper d-flex flex-column'>
                        <label htmlFor='storage' className='my-3'>
                            Storage client *
                        </label>
                        <select
                            name='storage'
                            id='storage'
                            className='mb-4 px-2 py-2 rounded-2 cursor-pointer color-bg-default'
                            defaultValue=''
                            style={{ border: '1px solid #1b1f2426' }}
                        >
                            <option value='' disabled>
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
                    <div className='d-flex flex-column flex-items-start p-0 gap-2'>
                        {files?.map((file, index) => (
                            <span key={index}>{file.name}</span>
                        ))}
                    </div>
                    <div className='mt-4 '>
                        <label htmlFor='file' className='upload-button'>
                            Upload NFT files
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
                    </div>
                </Box>
                <div className='mt-3 mt-md-5'>
                    {!isInteractingWithCM && (
                        <Button
                            variant='primary'
                            size='medium'
                            type='submit'
                            id='create-candy-machine-button'
                            sx={{ width: '100%' }}
                        >
                            Create candy machine
                        </Button>
                    )}
                    {isInteractingWithCM && (
                        <>
                            <Button isLoading disabled size='medium' sx={{ width: '100%' }}>
                                Creating Candy Machine... <Spinner size='small' />
                            </Button>
                        </>
                    )}
                </div>
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
        <div className={`d-flex ${type === 'checkbox' ? 'flex-row mt-3' : 'flex-column mt-0'}`}>
            <label htmlFor={id} className={`${type === 'checkbox' ? 'my-0' : 'mt-3 mb-2'}`}>
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
