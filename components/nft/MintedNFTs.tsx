import { FC } from 'react'
import { Spinner, Text } from '@primer/react'
import { Nft } from 'lib/nft/interfaces'
import NftCard from './NftCard'
import { useMintCandyMachine } from 'hooks'

const MintedNFTs: FC<{
    candyMachineAccount: string
    nfts: Nft[]
    isLoading: boolean
    fetchNfts: () => void
    error: string
}> = ({ candyMachineAccount, fetchNfts, nfts, isLoading, error }) => {
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
            {error?.includes('Error to fetch data') && (
                <Text as='p' className='mt-3 mb-4'>
                    Error to fetch data. Please, click the refresh button to try again.
                </Text>
            )}
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
                {nfts.map(
                    ({ name, image, mint }, index) =>
                        index < 10 && (
                            <NftCard
                                title={name}
                                imageLink={image}
                                key={index}
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
                )}
            </div>
        </div>
    )
}

export default MintedNFTs
