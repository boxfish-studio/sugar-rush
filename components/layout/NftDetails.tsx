import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useForm } from 'hooks'
import { updateNft } from 'lib/nft/actions'
import { Nft } from 'lib/nft/interfaces'
import { FC } from 'react'
import ActionButton from './ActionButton'

const NftDetails: FC<{ nft: Nft }> = ({ nft }) => {
    const wallet = useWallet()
    const { connection } = useConnection()

    async function onClickUpdateNft() {
        console.log('values', values)
        console.log('initialState', initialState)
        console.log('nft', nft)

        if (nft && connection && wallet.connected) await updateNft(nft, values, connection, wallet)
    }

    const initialState = {
        name: nft.name,
        symbol: nft.symbol,
        description: nft.description,
        animation_url: nft.animation_url,
        external_url: nft.external_url,
        seller_fee_basis_points: nft.seller_fee_basis_points,
    }

    const { onChange, onSubmit, values } = useForm(onClickUpdateNft, initialState)

    // Data to change
    // UpdateNftInput {
    //     nft: Nft;
    //     name?: string;
    //     symbol?: string;
    //     uri?: string;
    //     sellerFeeBasisPoints?: number;
    //     creators?: Creator[];
    //     collection?: Collection;
    //     uses?: Uses;
    //     newUpdateAuthority?: PublicKey;
    //     primarySaleHappened?: boolean;
    //     isMutable?: boolean;
    //     updateAuthority?: Signer;
    //     confirmOptions?: ConfirmOptions;
    // }

    return (
        <form className='flex flex-col items-center h-auto justify-center mt-4' onSubmit={onSubmit}>
            <div className='create-form flex flex-col p-6 xxl-shadow rounded-2xl scale-90 bg-slate-300 items-center justify-center'>
                {nft.name && (
                    <FormInput id='name' text='NFT Name' type='text' onChange={onChange} defaultValue={nft.name} />
                )}
                {nft.symbol && (
                    <FormInput
                        id='symbol'
                        text='NFT Symbol'
                        type='text'
                        onChange={onChange}
                        defaultValue={nft.symbol}
                    />
                )}
                {nft.description && (
                    <FormInput
                        id='description'
                        text='NFT Description'
                        type='text'
                        onChange={onChange}
                        defaultValue={nft.description}
                    />
                )}
                {nft.animation_url && (
                    <FormInput
                        id='animation_url'
                        text='NFT Animation Url'
                        type='text'
                        onChange={onChange}
                        defaultValue={nft.animation_url}
                    />
                )}
                {nft.external_url && (
                    <FormInput
                        id='external_url'
                        text='NFT External Url'
                        type='text'
                        onChange={onChange}
                        defaultValue={nft.external_url}
                    />
                )}
                {/* {nft.attributes &&
                    nft.attributes.map((atb, i) => {
                        return (
                            <div key={i}>
                                <label htmlFor={"Attributte-"} className='my-3 font-medium'>
                                    {`Attributte - ${i}`}
                                </label>
                                <input className='w-full p-2' type={'text'} defaultValue={{i} + ":" + {atb.trait_type} + "-" + {atb.value}} />
                            </div>
                        )
                    })}
                {nft.creators &&
                    nft.creators.map((atb, i) => {
                        return (
                            <span key={i}>
                                <strong>Creator Address</strong>: {atb.address}
                            </span>
                        )
                    })}
                {nft.properties?.creators &&
                    nft.properties.creators?.map((atb, i) => {
                        return (
                            <span key={i}>
                                <strong>Creator Address</strong>: {atb.address}
                            </span>
                        )
                    })}
                {nft.properties?.files &&
                    nft.properties.files?.map((atb, i) => {
                        return (
                            <span key={i}>
                                <strong>File</strong>: {atb.uri}
                            </span>
                        )
                    })} */}
                {nft.category && (
                    <FormInput
                        id='category'
                        text='NFT Category'
                        type='text'
                        onChange={onChange}
                        defaultValue={nft.category}
                    />
                )}
                {nft.collection && typeof nft?.collection === 'string' && (
                    <FormInput
                        id='collection'
                        text='NFT Collection'
                        type='text'
                        onChange={onChange}
                        disabled
                        defaultValue={nft.collection}
                    />
                )}
                {/* {nft.collection && typeof nft?.collection === 'object' && (
                    <span>
                        <strong>Collection Name</strong>: {nft.collection.name} / <strong>Family</strong>:{' '}
                        {nft.collection.family}
                    </span>
                )} */}
                {nft.seller_fee_basis_points && (
                    <FormInput
                        id='seller_fee_basis_points'
                        text='NFT Seller Fee Basis Points'
                        type='number'
                        onChange={onChange}
                        defaultValue={nft.seller_fee_basis_points}
                    />
                )}
                <ActionButton text='Update NFT' type='submit' />
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
    disabled?: boolean
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
    required,
    disabled,
    onChange,
}) => {
    return (
        <>
            <label htmlFor={id} className='my-3 font-medium'>
                {text}
            </label>
            <input
                className='w-full p-2'
                id={id}
                type={type}
                step='any'
                name={id}
                defaultValue={defaultValue}
                defaultChecked={defaultChecked}
                value={value}
                required={required}
                onChange={onChange}
                disabled={disabled}
            />
        </>
    )
}

export default NftDetails
