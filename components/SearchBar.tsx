import { TextInput } from '@primer/react'
import { Dispatch, SetStateAction, FC } from 'react'
import { SetterOrUpdater } from 'recoil'
import { SearchIcon } from '@primer/octicons-react'

const SearchBar: FC<{
    searchValue: string
    setSearchValue: SetterOrUpdater<string> | Dispatch<SetStateAction<string>>
}> = ({ searchValue, setSearchValue }) => {
    return (
        <TextInput
            icon={SearchIcon}
            className='border py-1 rounded-lg searchbox-candymachine f5 pl-2'
            type='search'
            placeholder='Search candy machine'
            onChange={({ target }) => setSearchValue(target.value)}
            value={searchValue}
            sx={{ '> input': { padding: '0' }, '> svg': { width: '15px', height: '15px' } }}
        />
    )
}

export default SearchBar
