import { FC, useState } from 'react'
import { useRouter } from 'next/router'
import SearchBar from './SearchBar'
import { useRecoilState } from 'recoil'
import { candyMachineSearchState } from 'lib/recoil-store/atoms'
import { Button } from '@primer/react'
import { LinkExternalIcon } from '@primer/octicons-react'
import { Popup } from 'components'
import CreateCandyMachine from 'pages/create-candy-machine'

const TopActions: FC = () => {
    const [searchValue, setSearchValue] = useRecoilState(candyMachineSearchState)
    const { pathname } = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className='d-flex flex-justify-end top-actions-bar d-flex flex-row'>
            {pathname === '/' ? (
                <>
                    <SearchBar
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        placeholderText='Search candy machine'
                    />
                    <Button variant='primary' onClick={() => setIsOpen(true)} className='text-capitalize'>
                        Create candy machine
                    </Button>
                    {isOpen && (
                        <Popup
                            setIsOpen={setIsOpen}
                            title='Create Candy Machine'
                            onClick={() => console.log('create a candy machine')}
                            buttonLabel='Create candy machine'
                            buttonType='primary'
                        >
                            <CreateCandyMachine />
                        </Popup>
                    )}
                </>
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
