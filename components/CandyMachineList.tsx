import { CandyMachineTile } from 'components'
import { FC } from 'react'

const CandyMachineList: FC<{
    candyMachineAccounts: string[]
}> = ({ candyMachineAccounts }) => {
    return (
        <>
            <div style={{ display: 'grid', gridRowGap: '16px' }}>
                {candyMachineAccounts?.map((account) => (
                    <CandyMachineTile key={account} account={account} />
                ))}
            </div>
        </>
    )
}

export default CandyMachineList
