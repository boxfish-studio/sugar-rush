import { FC, useState } from 'react'
import Link from 'next/link'
import { useSearchBar, useRemoveCandyMachineAccount } from 'hooks'

import { Modal } from 'components/Layout'

const CandyMachineCard: FC<{
  accounts: string[]
  setAccounts: React.Dispatch<React.SetStateAction<string[]>>
}> = ({ accounts, setAccounts }) => {
  const { searchResults, searchRef, setSearch } = useSearchBar(accounts)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState('')

  const { removeAccount } = useRemoveCandyMachineAccount(accounts, setAccounts)

  return (
    <>
      <input
        className='border border-slate-300 py-2 px-5 rounded-lg mt-16 w-full md:max-w-[27rem]'
        ref={searchRef}
        type='search'
        placeholder='Search candy machine...'
        onChange={(event) => setSearch(event.target.value)}
      />
      <Modal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        account={selectedAccount}
        callback={removeAccount}
      />
      <div className={`grid lg:grid-cols-${searchResults.length < 2 ? '1' : '2'} gap-7 mt-6 md:mt-8 grid-flow-row grid-cols-1`}>
        {searchResults.map((account) => (
          <div
            key={account}
            className='border border-slate-300 items-center justify-center p-4 flex flex-col relative rounded-xl shadow-xl w-full'
          >
            <span className='break-all'>{account}</span>
            <div className=' flex justify-around w-full flex-wrap'>
              <Link href={`/list-candy-machines/${account}`}>
                <a className=' mt-4 md:mt-8 text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 p-1 rounded-xl px-6'>
                  Inspect
                </a>
              </Link>
              <button
                className='text-white mt-4 md:mt-8 bg-red-500 hover:bg-red-400 transition ease-in-out duration-150 p-1 rounded-xl px-4'
                onClick={() => {
                  setSelectedAccount(account)
                  setIsOpen(true)
                }}
              >
                Delete
              </button>
              <Link href={`/verify-candy-machine/${account}`}>
                <a className='mt-4 md:mt-8 text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 p-1 rounded-xl px-4'>
                  Verify
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
