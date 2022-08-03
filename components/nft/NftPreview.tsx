import { FC, useEffect, useState } from 'react'
import { Button, Spinner, Text } from '@primer/react'
import { Nft } from 'lib/nft/interfaces'
import NftCard from './NftCard'

const NftPreview: FC<{
    candyMachineAccount: string
    itemsRemaining: number
    itemsAvailable: number
    mintedNfts: Nft[]
}> = ({ candyMachineAccount, itemsRemaining, itemsAvailable, mintedNfts }) => {
    const [nfts, setNfts] = useState<Nft[]>([])
    const [cache, setCache] = useState<File>()

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

    return (
        <div className='mt-5 mb-7'>
            {!nfts.length ? (
                <>
                    <h4>NFTs Preview · {itemsRemaining}</h4>
                    <Text as='p' className='mt-3 mb-4'>
                        Upload cache file to preview NFTs
                    </Text>
                </>
            ) : (
                <>
                    <h4>Unminted NFTs - {itemsAvailable - itemsRemaining}</h4>
                    <div className='mt-3 nfts-grid'>
                        {nfts.map(({ name, image }, index) => {
                            if (!mintedNfts?.some((minted) => minted.name === name)) {
                                return <NftCard title={name} imageLink={image} key={index} />
                            }
                        })}
                    </div>
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

export default NftPreview
