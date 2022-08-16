import { AnchorProvider, BN, Program } from '@project-serum/anchor'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { useForm, useRPC, useUploadCache } from 'hooks'
import { updateV2 } from 'lib/candy-machine'
import { CANDY_MACHINE_PROGRAM_V2_ID, DEFAULT_GATEKEEPER } from 'lib/candy-machine/constants'
import { StorageType } from 'lib/candy-machine/enums'
import { ICandyMachineConfig, IFetchedCandyMachineConfig } from 'lib/candy-machine/interfaces'
import { getCandyMachineV2Config, loadCandyProgramV2 } from 'lib/candy-machine/upload/config'
import { getCurrentDate, getCurrentTime, parseDateFromDateBN, parseDateToUTC, parseTimeFromDateBN } from 'lib/utils'
import { FC, useEffect, useState } from 'react'
import { Button, Spinner, StyledOcticon, Text } from '@primer/react'
import { AlertIcon } from '@primer/octicons-react'

const UpdateCandyMachine: FC<{
    candyMachineAccount?: string | string[]
    reloadMintCard: (value: boolean) => void
}> = ({ candyMachineAccount, reloadMintCard }) => {
    const { publicKey } = useWallet()
    const anchorWallet = useAnchorWallet()
    const { connection, network } = useRPC()

    const { cache, uploadCache } = useUploadCache()
    const [isInteractingWithCM, setIsInteractingWithCM] = useState(false)
    const [status, setStatus] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [candyMachineConfig, setCandyMachineConfig] = useState<IFetchedCandyMachineConfig>()

    const initialState = {
        price: candyMachineConfig?.price ? new BN(candyMachineConfig?.price).toNumber() / LAMPORTS_PER_SOL : 0,
        'number-of-nfts': 0,
        'treasury-account': candyMachineConfig?.solTreasuryAccount?.toBase58() ?? '',
        captcha: candyMachineConfig?.gatekeeper ?? false,
        mutable: candyMachineConfig?.isMutable ?? false,
        'date-mint': candyMachineConfig?.goLiveDate
            ? parseDateFromDateBN(candyMachineConfig?.goLiveDate)
            : getCurrentDate(),
        'time-mint': candyMachineConfig?.goLiveDate
            ? parseTimeFromDateBN(candyMachineConfig?.goLiveDate)
            : getCurrentTime(),

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

            if (publicKey && anchorWallet && candyMachineAccount && connection && network) {
                const provider = new AnchorProvider(connection, anchorWallet, {
                    preflightCommitment: 'recent',
                })

                const anchorProgram = await loadCandyProgramV2(provider)

                const candyMachineObj: any = await anchorProgram.account.candyMachine.fetch(
                    new PublicKey(candyMachineAccount)
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
                    candyMachinePubkey: candyMachineAccount,
                    publicKey,
                    treasuryWallet,
                    anchorProgram,
                    cache: await cache.text(),
                    newAuthority: values['new-authority'],
                })
                reloadMintCard(!!newSettings.gatekeeper)
                setStatus('Candy Machine updated successfully!')
            }
        } catch (err) {
            setErrorMessage('Candy Machine update was not successful, please re-run.')
        }
        setIsInteractingWithCM(false)
    }

    const fetchCandyMachine = async (): Promise<IFetchedCandyMachineConfig | undefined> => {
        if (candyMachineAccount && anchorWallet && connection) {
            setErrorMessage('')
            try {
                setIsLoading(true)
                const provider = new AnchorProvider(connection, anchorWallet, {
                    preflightCommitment: 'processed',
                })

                const idl = await Program.fetchIdl(CANDY_MACHINE_PROGRAM_V2_ID, provider)

                const program = new Program(idl!, CANDY_MACHINE_PROGRAM_V2_ID, provider)

                const state: any = await program.account.candyMachine.fetch(new PublicKey(candyMachineAccount))

                state.data.solTreasuryAccount = state.wallet
                state.data.itemsRedeemed = state.itemsRedeemed
                setErrorMessage('')
                return state.data
            } catch (err) {
                setErrorMessage((err as Error).message)
            }
            setIsLoading(false)
        }
    }

    useEffect(() => {
        setErrorMessage('')
        setIsLoading(false)
        fetchCandyMachine().then(setCandyMachineConfig)
        setIsLoading(false)
    }, [connection])

    if (isLoading) {
        return (
            <div className='d-flex flex-items-center'>
                <h3 className='mr-3'>Loading...</h3>
                <Spinner size='small' />
            </div>
        )
    }
    if (errorMessage) {
        return (
            <div className='d-flex flex-column items-center justify-center my-5 col-12 col-md-8 col-lg-6'>
                <h3 className='color-fg-accent'> Error fetching candy machine config</h3>
                <Button
                    className='rounded-lg bg-slate-400 p-2 mt-4'
                    onClick={() => fetchCandyMachine()}
                    sx={{ width: 'fit-content' }}
                >
                    Fetch again
                </Button>
            </div>
        )
    }

    return (
        <>
            {candyMachineConfig?.uuid && (
                <div className='d-flex flex-column'>
                    <div className='d-flex flex-column mb-6'>
                        <h3>Configuration</h3>
                        <div className='border-y width-full my-4' />
                        <form onSubmit={onSubmit} noValidate>
                            <div className='d-flex flex-column flex-justify-between col-12 col-md-8 col-lg-6'>
                                <FormInput
                                    id='price'
                                    text='Price of each NFT (SOL)'
                                    type='number'
                                    onChange={onChange}
                                    defaultValue={
                                        candyMachineConfig?.price
                                            ? new BN(candyMachineConfig.price).toNumber() / LAMPORTS_PER_SOL
                                            : undefined
                                    }
                                    required
                                />
                                <FormInput
                                    id='treasury-account'
                                    text='Treasury Account'
                                    type='text'
                                    onChange={onChange}
                                    defaultValue={candyMachineConfig?.solTreasuryAccount?.toBase58()}
                                />
                                <FormInput
                                    id='captcha'
                                    text='Captcha?'
                                    type='checkbox'
                                    onChange={onChange}
                                    defaultChecked={candyMachineConfig?.gatekeeper ?? false}
                                />

                                <FormInput
                                    id='mutable'
                                    text='Mutable?'
                                    type='checkbox'
                                    onChange={onChange}
                                    defaultChecked={candyMachineConfig?.isMutable}
                                />
                                <FormInput
                                    id='date-mint'
                                    text='Date for mint'
                                    type='date'
                                    onChange={onChange}
                                    defaultValue={
                                        candyMachineConfig?.goLiveDate
                                            ? parseDateFromDateBN(candyMachineConfig?.goLiveDate)
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
                                        candyMachineConfig?.goLiveDate
                                            ? parseTimeFromDateBN(candyMachineConfig?.goLiveDate)
                                            : getCurrentTime()
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

                                {cache && (
                                    <Text as='p' className='mt-3'>
                                        {cache?.name}
                                    </Text>
                                )}

                                <div className={cache ? 'mb-5' : 'my-5'}>
                                    <label htmlFor='cache' className='upload-button'>
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
                                            <StyledOcticon
                                                icon={AlertIcon}
                                                size={16}
                                                color='danger.fg'
                                                sx={{ marginRight: '6px' }}
                                            />{' '}
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
                    </div>
                </div>
            )}
        </>
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

export default UpdateCandyMachine
