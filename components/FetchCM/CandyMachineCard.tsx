import { FC } from 'react';
import Link from 'next/link';
import { useSearchBar } from 'hooks';
const CandyMachineCard: FC<{ accounts: string[] }> = ({ accounts }) => {
  const { searchResults, searchRef, setSearch } = useSearchBar(accounts);

  return (
    <>
      <input
        className='border border-gray-500 p-2 rounded-lg mt-6 md:min-w-[30rem] min-w-fit'
        ref={searchRef}
        type='search'
        placeholder='Search candy machine...'
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className='grid lg:grid-cols-2 gap-7 mt-6 grid-flow-row grid-cols-1'>
        {searchResults.map((account) => (
          <div
            key={account}
            className='bg-slate-300 items-center justify-center min-w-max p-2 h-28 flex flex-col relative rounded-xl shadow-xl'
          >
            {account}
            <Link href={`/list-candy-machines/${account}`}>
              <a className='text-white absolute left-6 bottom-2 bg-slate-800 w-fit p-1 rounded-xl px-6'>
                Inspect
              </a>
            </Link>
            <Link href={`/verify-candy-machine/${account}`}>
              <a className='text-white absolute right-6 bottom-2 bg-slate-800 w-fit p-1 rounded-xl px-4'>
                Verify Candy Machine
              </a>
            </Link>
          </div>
        ))}
      </div>
    </>
  );
};

export default CandyMachineCard;
