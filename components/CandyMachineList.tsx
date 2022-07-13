import { Modal } from 'components'
import { useRemoveCandyMachineAccount } from 'hooks'
import { candyMachineSearchState } from 'lib/recoil/atoms'
import { CandyMachineTile } from 'components'
import { FC, useState } from 'react'
import { useRecoilValue } from 'recoil'
const CandyMachineList: FC<{
    candyMachineAccounts: string[]
    setCandyMachineAccounts: React.Dispatch<React.SetStateAction<string[]>>
}> = ({ candyMachineAccounts, setCandyMachineAccounts }) => {
    const searchInput = useRecoilValue(candyMachineSearchState)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState('')

    const searchResults = candyMachineAccounts.filter((account) => {
        return account.toLowerCase().includes(searchInput.trim().toLowerCase())
    })

    const { removeAccount } = useRemoveCandyMachineAccount(candyMachineAccounts, setCandyMachineAccounts)

    return (
        <>
            <Modal isOpen={isOpen} setIsOpen={setIsOpen} account={selectedAccount} callback={removeAccount} />
            <div style={{ display: 'grid', gridRowGap: '16px' }}>
                {searchResults?.map((account) => (
                    <CandyMachineTile key={account} account={account} />
                ))}
            </div>
        </>
    )
}

export default CandyMachineList
