import { FC } from 'react'
import { Spinner } from '@primer/react'
import NftCard from './NftCard'
import { useMintCandyMachine } from 'hooks'
import { useRecoilValue } from 'recoil'
import { nftsState } from 'lib/recoil-store/atoms'

const MintedNFTs: FC<{
    candyMachineAccount: string
    isLoading: boolean
}> = ({ candyMachineAccount, isLoading }) => {
    const { isUserMinting, itemsRemaining, mintAccount, isCaptcha } = useMintCandyMachine(candyMachineAccount as string)
    const nfts = useRecoilValue(nftsState)

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
                                onClick: () => mintAccount(),
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
