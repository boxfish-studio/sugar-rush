import { Modal } from 'components'
import { useRemoveCandyMachineAccount, useSearchBar } from 'hooks'
import Link from 'next/link'
import { FC, useState } from 'react'

const CandyMachineCard: FC<{
    candyMachineAccounts: string[]
    setCandyMachineAccounts: React.Dispatch<React.SetStateAction<string[]>>
}> = ({ candyMachineAccounts, setCandyMachineAccounts }) => {
    const { searchResults, searchRef, setSearch } = useSearchBar(candyMachineAccounts)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState('')

    const { removeAccount } = useRemoveCandyMachineAccount(candyMachineAccounts, setCandyMachineAccounts)

    return (
        <>
            <input
                className='border border-slate-300 py-2 px-5 rounded-lg mt-16 w-full md:max-w-[27rem]'
                ref={searchRef}
                type='search'
                placeholder='Search candy machine...'
                onChange={(event) => setSearch(event.target.value)}
            />
            <Modal isOpen={isOpen} setIsOpen={setIsOpen} account={selectedAccount} callback={removeAccount} />
            <div className='grid grid-cols-1 gap-7 mt-6 md:mt-8'>
                {searchResults.map((account) => (
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
                                    Verify
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
