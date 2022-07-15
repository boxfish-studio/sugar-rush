import { Popup } from 'components'
import { candyMachineSearchState } from 'lib/recoil-store/atoms'
import { CandyMachineTile } from 'components'
import { FC, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { Button } from '@primer/react'
import CreateCandyMachine from 'pages/create-candy-machine'

const CandyMachineList: FC<{
    candyMachineAccounts: string[]
    setCandyMachineAccounts?: React.Dispatch<React.SetStateAction<string[]>>
}> = ({ candyMachineAccounts, setCandyMachineAccounts }) => {
    const searchInput = useRecoilValue(candyMachineSearchState)
    const [isOpen, setIsOpen] = useState(false)

    const searchResults = candyMachineAccounts.filter((account) => {
        return account.toLowerCase().includes(searchInput.trim().toLowerCase())
    })

    return (
        <>
            {isOpen && (
                <Popup setIsOpen={setIsOpen} title='Title' onClick={() => console.log('create a candy machine')}>
                    <CreateCandyMachine />
                </Popup>
            )}
            <div style={{ display: 'grid', gridRowGap: '16px' }}>
                {searchResults?.map((account) => (
                    <CandyMachineTile key={account} account={account} />
                ))}
            </div>
            <Button onClick={() => setIsOpen(true)}>Add Candy Machine</Button>
        </>
    )
}

export default CandyMachineList
