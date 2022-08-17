import { FC, useEffect, useState } from 'react'
import { Text } from '@primer/react'
import { Nft } from 'lib/nft/interfaces'
import NftCard from './NftCard'
import { useRecoilValue } from 'recoil'
import { nftsState } from 'lib/recoil-store/atoms'
import { ArrayWrapper, FilterArrayContext } from 'contexts/ArrayWrapper'
import { MINIMUM_NFTS_TO_SHOW } from 'lib/constants'

const PreviewNFTs: FC<{
    candyMachineAccount: string
    itemsAvailable: number
    itemsRemaining: number
}> = ({ candyMachineAccount, itemsAvailable, itemsRemaining }) => {
    const [nfts, setNfts] = useState<Nft[]>([])
    const [cache, setCache] = useState<File>()
    const [unmintedNfts, setUnmintedNfts] = useState<Nft[]>([])
    const mintedNfts = useRecoilValue(nftsState)

    const viewNfts = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length == 0) {
            window.alert('No files uploaded')
            return
        }
        setCache(e.target.files[0])
        let cacheData = await e.target.files[0].text()
        let cacheDataJson = JSON.parse(cacheData)
        if (!cacheDataJson.items) {
            alert('NFTs Preview not available in cache file')
        } else if (cacheDataJson?.program?.candyMachine === candyMachineAccount) {
            const nfts = Object.values(cacheDataJson.items).map((nft: any) => {
                return {
                    image: nft.imageLink,
                    name: nft.name,
                }
            })

            setNfts(nfts)
        } else {
            alert('This cache file is not from this candy machine')
        }
    }

    useEffect(() => {
        setUnmintedNfts(nfts?.filter((nft) => !mintedNfts?.includes(nft)))
    }, [nfts, mintedNfts])

    return (
        <div className='mb-7 mt-5'>
            {!nfts.length ? (
                <>
                    <h4>NFTs Preview · {itemsRemaining}</h4>
                    <Text as='p' className='mt-3 mb-4'>
                        Upload cache file to preview NFTs
                    </Text>
                    <Text as='p' className='my-3'>
                        {cache?.name}
                    </Text>
                </>
            ) : (
                <>
                    <h4>Unminted NFTs - {itemsAvailable - itemsRemaining}</h4>
                    <ArrayWrapper array={unmintedNfts} minimum={MINIMUM_NFTS_TO_SHOW}>
                        <FilterArrayContext.Consumer>
                            {([unmintedArr]) => (
                                <div className='nfts-grid'>
                                    {unmintedArr.map(({ name, image, mint }) => (
                                        <NftCard title={name} imageLink={image} key={mint?.toBase58()} />
                                    ))}
                                </div>
                            )}
                        </FilterArrayContext.Consumer>
                    </ArrayWrapper>
                    <Text as='p' className='my-3'>
                        {cache?.name}
                    </Text>
                </>
            )}
            <label
                htmlFor='nftsCache'
                className='px-4 py-2 rounded-2 cursor-pointer color-bg-inset'
                style={{ border: '1px solid #1b1f2426' }}
            >
                Upload Cache file
            </label>
            <input id='nftsCache' type='file' name='cache' onChange={viewNfts} className='w-full p-2 d-none' required />
        </div>
    )
}

export default PreviewNFTs
