import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useForm } from 'hooks'
import { updateNft } from 'lib/nft/actions'
import { Nft } from 'lib/nft/interfaces'
import { FC, useState } from 'react'
import ActionButton from './ActionButton'

const NftDetails: FC<{ nft: Nft }> = ({ nft }) => {
    const wallet = useWallet()
    const { connection } = useConnection()
    const [nftUpdated, setNftUpdated] = useState({ error: false, message: '' })

    async function onClickUpdateNft() {
        const valuesData = Object.entries(values)
        const initialStateData = Object.values(initialState)
        let modifiedValues = []

        for (let i = 0; i < Object.keys(initialState).length; i++) {
            if (valuesData[i][1] !== initialStateData[i]) {
                modifiedValues.push(valuesData[i])
            }
        }
        if (modifiedValues.length === 0) {
            setNftUpdated({ error: true, message: 'No changes made' })
        }

        if (nft?.mintAddress && connection && wallet.connected && modifiedValues.length > 0) {
            setNftUpdated({ error: false, message: '' })
            let responseUpdateNft = await updateNft(nft.mintAddress, modifiedValues, connection, wallet)
            if (responseUpdateNft === 'NFT mint address not provided') {
                setNftUpdated({ error: true, message: responseUpdateNft })
            } else {
                setNftUpdated({ error: false, message: responseUpdateNft })
            }
        }
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
                        disabled
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
                {nft.attributes &&
                    nft.attributes.map((atb, i) => {
                        return (
                            <>
                                <div className='w-full p-2' key={i}>
                                    <FormInput
                                        id={`attribute-${i}-trait_type`}
                                        text={`Attributte - ${i}: Trait Type`}
                                        type='text'
                                        onChange={onChange}
                                        disabled
                                        defaultValue={`${atb.trait_type}`}
                                    />
                                    <FormInput
                                        id={`attribute-${i}-value`}
                                        text={`Attributte - ${i}: Value`}
                                        type='text'
                                        onChange={onChange}
                                        disabled
                                        defaultValue={`${atb.value}`}
                                    />
                                </div>
                            </>
                        )
                    })}
                {nft.creators &&
                    nft.creators.map((atb, i) => {
                        return (
                            <div className='w-full p-2' key={i}>
                                <FormInput
                                    id={`creators-${i}`}
                                    text={`Creator - ${i}`}
                                    type='text'
                                    onChange={onChange}
                                    disabled
                                    defaultValue={`${atb.address}`}
                                />
                            </div>
                        )
                    })}
                {nft.properties?.creators &&
                    nft.properties.creators?.map((atb, i) => {
                        return (
                            <div className='w-full p-2' key={i}>
                                <FormInput
                                    id={`creator-${i}`}
                                    text={`Creator - ${i}`}
                                    type='text'
                                    onChange={onChange}
                                    disabled
                                    defaultValue={`${atb.address}`}
                                />
                            </div>
                        )
                    })}
                {nft.properties?.files &&
                    nft.properties.files?.map((atb, i) => {
                        return (
                            <div className='w-full p-2' key={i}>
                                <FormInput
                                    id={`file-${i}`}
                                    text={`File - ${i}`}
                                    type='text'
                                    onChange={onChange}
                                    disabled
                                    defaultValue={`${atb.uri}`}
                                />
                            </div>
                        )
                    })}
                {nft.category && (
                    <FormInput
                        id='category'
                        text='NFT Category'
                        type='text'
                        onChange={onChange}
                        disabled
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
                {nft.collection && typeof nft?.collection === 'object' && (
                    <>
                        <FormInput
                            id='collection'
                            text='NFT Collection Name'
                            type='text'
                            onChange={onChange}
                            defaultValue={nft.collection.name}
                        />
                        <FormInput
                            id='collection'
                            text='NFT Collection Family'
                            type='text'
                            onChange={onChange}
                            disabled
                            defaultValue={nft.collection.family}
                        />
                    </>
                )}
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
                {nftUpdated.message.length !== 0 && nftUpdated.error && (
                    <div className='text-red-500 text-center mt-6'>{nftUpdated.message}</div>
                )}
                {nftUpdated.message.length !== 0 && !nftUpdated.error && (
                    <div className='text-[hsl(258,52%,56%)] text-center mt-6'>{nftUpdated.message}</div>
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
