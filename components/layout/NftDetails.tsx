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
        console.log('nft', nft)
        console.log('connection', connection)
        console.log('wallet.connected', wallet.connected)

        // if (nft && connection && wallet.connected) await updateNft(nft, connection, wallet)
    }
    const { onChange, onSubmit, values } = useForm(onClickUpdateNft, null)

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
                    <>
                        <label htmlFor={'name'} className='my-3 font-medium'>
                            {'name'}
                        </label>
                        <input onChange={onChange} className='w-full p-2' type={'text'} defaultValue={nft.name} />
                    </>
                )}
                {nft.symbol && (
                    <>
                        <label htmlFor={'symbol'} className='my-3 font-medium'>
                            {'symbol'}
                        </label>
                        <input onChange={onChange} className='w-full p-2' type={'text'} defaultValue={nft.symbol} />
                    </>
                )}
                {nft.description && (
                    <>
                        <label htmlFor={'description'} className='my-3 font-medium'>
                            {'description'}
                        </label>
                        <input
                            onChange={onChange}
                            className='w-full p-2'
                            type={'text'}
                            defaultValue={nft.description}
                        />
                    </>
                )}
                {nft.animation_url && (
                    <>
                        <label htmlFor={'animation_url'} className='my-3 font-medium'>
                            {'animation_url'}
                        </label>
                        <input
                            onChange={onChange}
                            className='w-full p-2'
                            type={'text'}
                            defaultValue={nft.animation_url}
                        />
                    </>
                )}
                {nft.external_url && (
                    <>
                        <label htmlFor={'external_url'} className='my-3 font-medium'>
                            {'external_url'}
                        </label>
                        <input
                            onChange={onChange}
                            className='w-full p-2'
                            type={'text'}
                            defaultValue={nft.external_url}
                        />
                    </>
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
                    <>
                        <label htmlFor={'category'} className='my-3 font-medium'>
                            {'category'}
                        </label>
                        <input disabled className='w-full p-2' type={'text'} defaultValue={nft.category} />
                    </>
                )}
                {nft.collection && typeof nft?.collection === 'string' && (
                    <>
                        <label htmlFor={'collection'} className='my-3 font-medium'>
                            {'collection'}
                        </label>
                        <input disabled className='w-full p-2' type={'text'} defaultValue={nft.collection} />
                    </>
                )}
                {/* {nft.collection && typeof nft?.collection === 'object' && (
                    <span>
                        <strong>Collection Name</strong>: {nft.collection.name} / <strong>Family</strong>:{' '}
                        {nft.collection.family}
                    </span>
                )} */}
                {nft.seller_fee_basis_points && (
                    <>
                        <label htmlFor={'seller_fee_basis_points'} className='my-3 font-medium'>
                            {'seller_fee_basis_points'}
                        </label>
                        <input
                            onChange={onChange}
                            className='w-full p-2'
                            type={'text'}
                            defaultValue={nft.seller_fee_basis_points}
                        />
                    </>
                )}
                <ActionButton text='Update NFT' type='submit' />
            </div>
        </form>
    )
}

export default NftDetails
