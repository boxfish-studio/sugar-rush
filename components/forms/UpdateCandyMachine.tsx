import { AnchorProvider, BN } from '@project-serum/anchor'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { useForm, useRPC, useUploadCache } from 'hooks'
import { updateV2 } from 'lib/candy-machine'
import { DEFAULT_GATEKEEPER } from 'lib/candy-machine/constants'
import { StorageType } from 'lib/candy-machine/enums'
import { ICandyMachineConfig, IFetchedCandyMachineConfig } from 'lib/candy-machine/interfaces'
import { getCandyMachineV2Config, loadCandyProgramV2 } from 'lib/candy-machine/upload/config'
import { getCurrentDate, getCurrentTime, parseDateFromDateBN, parseDateToUTC, parseTimeFromDateBN } from 'lib/utils'
import React, { FC, useState } from 'react'
import { Button, Spinner, StyledOcticon } from '@primer/react'
import { AlertIcon } from '@primer/octicons-react'

const UpdateCreateCandyMachineForm: FC<{
    fetchedValues?: IFetchedCandyMachineConfig
    candyMachinePubkey?: string | string[]
}> = ({ fetchedValues, candyMachinePubkey }) => {
    const { publicKey } = useWallet()
    const anchorWallet = useAnchorWallet()
    const { connection } = useRPC()

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

    const { onChange, onSubmit, values } = useForm(updateCandyMachineV2, initialState)

    function isFormUpdateValid(): boolean {
        if (!values['date-mint'] || !values['time-mint']) return false
        if (values.price === 0 || isNaN(values.price)) return false
        if (!cache) {
            setErrorMessage('There are no files to upload')
            return false
        }
        if (values.price == 0 || isNaN(values.price)) {
            setErrorMessage('The Price of each NFT cannot be 0')
            return false
        }
        setErrorMessage('')
        return true
    }

    async function updateCandyMachineV2() {
        try {
            if (!isFormUpdateValid()) return
            setIsInteractingWithCM(true)
            setStatus('')

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

            if (publicKey && anchorWallet && candyMachinePubkey && connection) {
                const provider = new AnchorProvider(connection, anchorWallet, {
                    preflightCommitment: 'recent',
                })

                const anchorProgram = await loadCandyProgramV2(provider)

                const candyMachineObj: any = await anchorProgram.account.candyMachine.fetch(
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
                    itemsAvailable: number ? new BN(number) : candyMachineObj.data.itemsAvailable,
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
        <form onSubmit={onSubmit} noValidate>
            <div className='d-flex flex-column flex-justify-between col-12 col-md-8 col-lg-6'>
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
                    id='treasury-account'
                    text='Treasury Account'
                    type='text'
                    onChange={onChange}
                    defaultValue={fetchedValues?.solTreasuryAccount?.toBase58()}
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
                        fetchedValues?.goLiveDate ? parseDateFromDateBN(fetchedValues?.goLiveDate) : getCurrentDate()
                    }
                    required
                />
                <FormInput
                    id='time-mint'
                    text='Time for mint (GMT)'
                    type='time'
                    onChange={onChange}
                    defaultValue={
                        fetchedValues?.goLiveDate ? parseTimeFromDateBN(fetchedValues?.goLiveDate) : getCurrentTime()
                    }
                    required
                />

                {/* No default value since it is dangerous to transfer the authority of the CM to another account. */}
                <FormInput
                    id='new-authority'
                    placeholder='Enter a new authority'
                    text='New Authority'
                    type='text'
                    onChange={onChange}
                />

                <div className='my-5'>
                    <label
                        htmlFor='cache'
                        className='px-4 py-2 rounded-2 cursor-pointer color-bg-inset'
                        style={{ border: '1px solid #1b1f2426' }}
                    >
                        Upload Cache file
                    </label>
                    <input
                        id='cache'
                        type='file'
                        name='cache'
                        onChange={uploadCache}
                        className='w-full p-2 d-none'
                        required
                    />
                </div>

                {errorMessage.length > 0 && (
                    <div className='my-3 color-fg-closed color-bg-closed border color-border-closed-emphasis p-3 rounded-2'>
                        <span>
                            <StyledOcticon icon={AlertIcon} size={16} color='danger.fg' sx={{ marginRight: '6px' }} />{' '}
                            {errorMessage}
                        </span>
                    </div>
                )}

                {!isInteractingWithCM && (
                    <Button variant='primary' size='medium' type='submit' sx={{ width: 'fit-content' }}>
                        Update Candy Machine
                    </Button>
                )}

                {isInteractingWithCM && (
                    <Button isLoading disabled size='medium' sx={{ width: 'fit-content' }}>
                        Updating Candy Machine... <Spinner size='small' />
                    </Button>
                )}

                {!isInteractingWithCM && status && (
                    <span className='color-fg-success color-bg-success border color-border-success rounded-2 mt-4 p-3 wb-break-word'>
                        {status}
                    </span>
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
    required?: boolean
    value?: string | number
    placeholder?: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const FormInput: FC<Input> = ({
    id,
    text,
    placeholder,
    type,
    defaultValue,
    defaultChecked,
    value,
    required,
    onChange,
}) => {
    return (
        <div className={`d-flex ${type === 'checkbox' ? 'flex-row mt-3' : 'flex-column mt-0'}`}>
            <label htmlFor={id} className={`${type === 'checkbox' ? 'my-0' : 'mt-3 mb-2'}`}>
                {text}
            </label>
            <input
                style={{ border: '1px solid #1b1f2426' }}
                className={`w-full p-2 rounded-2 color-bg-inset ${type === 'checkbox' ? 'ml-2' : 'ml-0'}`}
                id={id}
                type={type}
                step='any'
                name={id}
                defaultValue={defaultValue}
                defaultChecked={defaultChecked}
                value={value}
                required={required}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    )
}

export default UpdateCreateCandyMachineForm
