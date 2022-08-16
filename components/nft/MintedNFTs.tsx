import { FC } from 'react'
import { Spinner } from '@primer/react'
import { Nft } from 'lib/nft/interfaces'
import NftCard from './NftCard'
import { useMintCandyMachine } from 'hooks'
import { ArrayWrapper, FilterArrayContext } from 'contexts/ArrayWrapper'
import { MINIMUM_NFTS_TO_SHOW } from 'lib/constants'

const MintedNFTs: FC<{
    candyMachineAccount: string
    nfts: Nft[]
    isLoading: boolean
    fetchNfts: () => void
}> = ({ candyMachineAccount, fetchNfts, nfts, isLoading }) => {
    const { isUserMinting, itemsRemaining, mintAccount, isCaptcha } = useMintCandyMachine(candyMachineAccount as string)

    if (isLoading) {
        return (
            <div className='d-flex flex-items-center'>
                <h3 className='mr-3'>Loading...</h3>
                <Spinner size='small' />
            </div>
        )
    }

    return (
        <div>
            <h4>Minted NFTs - {nfts.length}</h4>
            <div className='nfts-grid mt-3'>
                {itemsRemaining > 0 && isCaptcha && (
                    <NftCard
                        title={'New NFT'}
                        buttons={[
                            {
                                text: 'Captcha enabled',
                                as: 'button',
                                variant: 'outline',
                                disabled: true,
                            },
                        ]}
                    />
                )}
                {itemsRemaining > 0 && !isCaptcha && (
                    <NftCard
                        title={'New NFT'}
                        buttons={[
                            {
                                text: 'Mint 1 NFT',
                                isLoading: isUserMinting,
                                as: 'button',
                                variant: 'primary',
                                onClick: () => mintAccount().then(fetchNfts),
                            },
                        ]}
                    />
                )}
                <ArrayWrapper
                    array={nfts}
                    minimum={itemsRemaining > 0 ? MINIMUM_NFTS_TO_SHOW - 1 : MINIMUM_NFTS_TO_SHOW}
                >
                    <FilterArrayContext.Consumer>
                        {([mintedArray]) => (
                            <div className='nfts-grid'>
                                {mintedArray?.map(({ name, image, mint }) => {
                                    return (
                                        <NftCard
                                            title={name}
                                            imageLink={image}
                                            key={mint?.toBase58()}
                                            buttons={[
                                                {
                                                    text: 'View in Solscan',
                                                    as: 'link',
                                                    variant: 'invisible',
                                                    hash: mint?.toBase58(),
                                                },
                                            ]}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </FilterArrayContext.Consumer>
                </ArrayWrapper>
            </div>
        </div>
    )
}

export default MintedNFTs
