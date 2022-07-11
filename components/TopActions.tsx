import { FC } from 'react'
import SearchBar from './SearchBar'
import { useRecoilState } from 'recoil'
import { candyMachineSearchState } from 'lib/recoil/atoms'

const TopActions: FC = () => {
    const [searchValue, setSearchValue] = useRecoilState(candyMachineSearchState)

    return (
        <div className='d-flex flex-justify-end top-actions-bar d-flex flex-row pt-8'>
            <SearchBar searchValue={searchValue} setSearchValue={setSearchValue} />
        </div>
    )
}
export default TopActions
