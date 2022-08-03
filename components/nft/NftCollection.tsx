import { FC } from 'react'
import { Nft } from 'lib/nft/interfaces'
import NftCard from './NftCard'

const NftCollection: FC<{
    nft: Nft
}> = ({ nft }) => {
    return (
        <div className='mb-5 mt-5'>
            <h4>Collection</h4>
            <div className='d-flex flex-justify-start flex-items-center gap-5 mt-3'>
                <NftCard
                    title={nft.name}
                    imageLink={nft.image}
                    buttons={[
                        {
                            text: 'View in Solscan',
                            as: 'link',
                            variant: 'invisible',
                            hash: '14eoYMYLY19gtfE1gwWDhnjDD3fDjGTQTGyicBKT33Ns',
                        },
                    ]}
                />
            </div>
        </div>
    )
}

export default NftCollection
