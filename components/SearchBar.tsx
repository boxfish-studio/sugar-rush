import { Dispatch, SetStateAction, FC } from 'react'
import { SetterOrUpdater } from 'recoil'

const SearchBar: FC<{
    searchValue: string
    setSearchValue: SetterOrUpdater<string> | Dispatch<SetStateAction<string>>
}> = ({ searchValue, setSearchValue }) => {
    return (
        <input
            className='border py-1 rounded-lg searchbox-candymachine f5'
            type='search'
            placeholder='Search candy machine'
            onChange={({ target }) => setSearchValue(target.value)}
            value={searchValue}
        />
    )
}

export default SearchBar
