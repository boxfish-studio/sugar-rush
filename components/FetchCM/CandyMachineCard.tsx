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
        className='border border-gray-500 p-2 rounded-lg mt-6 md:min-w-[30rem] min-w-fit'
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
      <div className='grid lg:grid-cols-2 gap-7 mt-6 grid-flow-row grid-cols-1'>
        {searchResults.map((account) => (
          <div
            key={account}
            className='bg-slate-300 items-center justify-center  p-2 h-28 flex flex-col relative rounded-xl shadow-xl w-[28rem]'
          >
            {account}

            <Link href={`/list-candy-machines/${account}`}>
              <a className='text-white absolute left-6 bottom-2 bg-slate-800 p-1 rounded-xl px-6'>
                Inspect
              </a>
            </Link>
            <button
              className='text-white absolute left-48 bottom-2 bg-red-500 p-1 rounded-xl px-4'
              onClick={() => {
                setSelectedAccount(account)
                setIsOpen(true)
              }}
            >
              Delete
            </button>
            <Link href={`/verify-candy-machine/${account}`}>
              <a className='text-white absolute right-6 bottom-2 bg-slate-800 p-1 rounded-xl px-4'>
                Verify
              </a>
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}

export default CandyMachineCard
