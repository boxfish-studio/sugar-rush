import { FC } from 'react'
import { useRouter } from 'next/router'
import SearchBar from './SearchBar'
import { useRecoilState } from 'recoil'
import { candyMachineSearchState } from 'lib/recoil/atoms'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@primer/react'
import { LinkExternalIcon } from '@primer/octicons-react'

const TopActions: FC = () => {
    const [searchValue, setSearchValue] = useRecoilState(candyMachineSearchState)
    const router = useRouter()
    const { publicKey } = useWallet()

    if (publicKey) {
        return (
            <div className='d-flex flex-justify-end top-actions-bar d-flex flex-row pt-8'>
                {router.pathname === '/' ? (
                    <SearchBar searchValue={searchValue} setSearchValue={setSearchValue} />
                ) : (
                    <>
                        <Button variant='danger'>Delete</Button>
                        <Button variant='outline'>Verify</Button>
                        <Button leadingIcon={LinkExternalIcon}>View in Solscan</Button>
                    </>
                )}
            </div>
        )
    }
    return null
}
export default TopActions
