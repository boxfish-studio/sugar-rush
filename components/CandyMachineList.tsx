import { candyMachineSearchState } from 'lib/recoil/atoms'
import { CandyMachineTile } from 'components'
import { FC } from 'react'
import { useRecoilValue } from 'recoil'
const CandyMachineList: FC<{
    candyMachineAccounts: string[]
}> = ({ candyMachineAccounts }) => {
    const searchInput = useRecoilValue(candyMachineSearchState)

    const searchResults = candyMachineAccounts.filter((account) => {
        return account.toLowerCase().includes(searchInput.trim().toLowerCase())
    })

    return (
        <>
            <div style={{ display: 'grid', gridRowGap: '16px' }}>
                {searchResults?.map((account) => (
                    <CandyMachineTile key={account} account={account} />
                ))}
            </div>
        </>
    )
}

export default CandyMachineList
