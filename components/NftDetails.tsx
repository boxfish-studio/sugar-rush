import { Nft } from 'lib/nft/interfaces'
import { FC } from 'react'

const NftDetails: FC<{ nft: Nft }> = ({ nft }) => {
    return (
        <div className='flex flex-column gap-3 p-5 mt-3 border-grey-500 border-2 rounded-lg'>
            {nft.symbol && (
                <span>
                    <strong>Symbol</strong>: {nft.symbol}
                </span>
            )}
            {nft.description && (
                <span>
                    <strong>Description</strong>: {nft.description}
                </span>
            )}
            {nft.animation_url && (
                <span>
                    <strong>Animation Ulrl</strong>: {nft.animation_url}
                </span>
            )}
            {nft.external_url && (
                <span>
                    <strong>External Url</strong>: {nft.external_url}
                </span>
            )}
            {nft.attributes &&
                nft.attributes.map((atb, i) => {
                    return (
                        <span key={i}>
                            <strong>Attributte</strong> {i}: {atb.trait_type} - {atb.value}
                        </span>
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
                })}
            {nft.category && (
                <span>
                    <strong>Category</strong>: {nft.category}
                </span>
            )}
            {nft.collection && typeof nft?.collection === 'string' && (
                <span>
                    <strong>Collection</strong>: {nft.collection}
                </span>
            )}
            {nft.collection && typeof nft?.collection === 'object' && (
                <span>
                    <strong>Collection Name</strong>: {nft.collection.name} / <strong>Family</strong>:{' '}
                    {nft.collection.family}
                </span>
            )}
            {nft.seller_fee_basis_points && (
                <span>
                    <strong>Seller Fee Basis Points</strong>: {nft.seller_fee_basis_points}
                </span>
            )}
        </div>
    )
}

export default NftDetails
