import { FC } from 'react'
import { useRouter } from 'next/router'
import SearchBar from './SearchBar'
import { useRecoilState } from 'recoil'
import { candyMachineSearchState } from 'lib/recoil/atoms'
import { Button } from '@primer/react'
import { LinkExternalIcon } from '@primer/octicons-react'

const TopActions: FC = () => {
    const [searchValue, setSearchValue] = useRecoilState(candyMachineSearchState)
    const { pathname } = useRouter()

    return (
        <div className='d-flex flex-justify-end top-actions-bar d-flex flex-row mt-16 pt-6 container-xl'>
            {pathname === '/' ? (
                <SearchBar
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    placeholderText='Search candy machine'
                />
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

export default TopActions
