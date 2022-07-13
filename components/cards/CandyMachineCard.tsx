import { Modal } from 'components'
import { useRemoveCandyMachineAccount } from 'hooks'
import { candyMachineSearchState } from 'lib/recoil/atoms'
import Link from 'next/link'
import { FC, useState } from 'react'
import { useRecoilValue } from 'recoil'
const CandyMachineCard: FC<{
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
            <div className='grid grid-cols-1 gap-7 mt-6 md:mt-8'>
                {searchResults?.map((account) => (
                    <div
                        key={account}
                        className='border border-slate-300 items-center justify-center p-4 flex flex-col relative rounded-xl shadow-xl w-full'
                    >
                        <span className='break-all'>{account}</span>
                        <div className=' flex justify-around w-full flex-wrap'>
                            <Link href={`/${account}`}>
                                <a className='mt-4 md:mt-8 px-4 py-2 text-white transition-all duration-300 ease-linear bg-[hsl(258,52%,56%)] shadow-lg cursor-pointer hover:bg-[hsl(258,52%,65%)] rounded-xl'>
                                    Inspect
                                </a>
                            </Link>
                            <button
                                className='text-white mt-4 md:mt-8 bg-red-500 hover:bg-red-400 px-4 py-2 transition-all duration-300 ease-linear shadow-lg cursor-pointer rounded-xl'
                                onClick={() => {
                                    setSelectedAccount(account)
                                    setIsOpen(true)
                                }}
                            >
                                Delete
                            </button>
                            <Link href={`/verify-candy-machine/${account}`}>
                                <a className='mt-4 md:mt-8 px-4 py-2 text-white transition-all duration-300 ease-linear bg-[hsl(258,52%,56%)] shadow-lg cursor-pointer hover:bg-[hsl(258,52%,65%)] rounded-xl'>
                                    Verify & Mint
                                </a>
                            </Link>
                            <Link href={`/view-candy-machine/${account}`}>
                                <a className='mt-4 md:mt-8 px-4 py-2 text-white transition-all duration-300 ease-linear bg-[hsl(258,52%,56%)] shadow-lg cursor-pointer hover:bg-[hsl(258,52%,65%)] rounded-xl'>
                                    View
                                </a>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default CandyMachineCard
