import { FC } from 'react';
import Link from 'next/link';

const CandyMachineCard: FC<{ account: string }> = ({ account }) => {
  return (
    <div className='bg-slate-300 items-center justify-center max-w-md p-2 h-28 flex flex-col relative rounded-xl'>
      {account}
      <Link href={`/list-candy-machines/${account}`}>
        <a className='text-white absolute left-6 bottom-2 bg-slate-800 w-fit p-1 rounded-xl px-6'>
          Inspect
        </a>
      </Link>
    </div>
  );
};

export default CandyMachineCard;
