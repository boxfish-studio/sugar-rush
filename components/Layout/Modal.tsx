import { useConnection } from '@solana/wallet-adapter-react';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import styles from 'styles/Modal.module.css';

const Modal: FC<{
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  account: string;
  callback: (account: string) => Promise<string | undefined>;
}> = ({ isOpen, setIsOpen, callback, account }) => {
  const { connection } = useConnection();

  const [isLoading, setIsLoading] = useState(false);
  const [tx, setTx] = useState('');
  const [error, setError] = useState('');

  function handleModal(e: any) {
    const target = e.target as HTMLDivElement;
    if (target.nodeName === 'DIV') closeModal();
  }
  function closeModal() {
    setIsOpen(false);
    setIsLoading(false);
    setTx('');
    setError('');
  }

  async function runCallback() {
    try {
      setIsLoading(true);
      const tx = await callback(account);
      setIsLoading(false);
      if (!tx) return setError('Error: No transaction returned');
      setTx(tx);
    } catch (e) {
      closeModal();
    }
  }
  return (
    <>
      {isOpen && (
        <div
          className={`flex fixed pt-8 left-20 top-0 w-full h-full overflow-auto z-10 bg-slate-400/50 scale-0 ${styles.modal}`}
          onClick={handleModal}
        >
          <span className='p-8 pt-16 bg-[hsl(0,0%,100%)] m-auto overflow-hidden flex relative flex-col w-[40rem] rounded-2xl h-[22rem] shadow-xl'>
            <button className={styles.hamb} onClick={closeModal}>
              <span className={styles.line} />
              <span className={styles.line} />
            </button>
            <span className={`flex flex-col ${styles.text}`}>
              <a
                className='text-blue-700 hover:underline my-3'
                href={`https://solscan.io/account/${account}${
                  connection.rpcEndpoint.includes('devnet')
                    ? '?cluster=devnet'
                    : ''
                }`}
                target='_blank'
                rel='noopener noreferrer'
              >
                {account} - View in Solscan
              </a>
              <h1 className='text-red-500 text-xl'>
                <span className='font-bold'>WARNING!</span> You are attempting to remove an account from the Candy
                Machine. This means all the unminted NFTs will be gone forever. This will refund the SOL locked from the account to your wallet.
              </h1>

              <span className='flex flex-col  justify-center items-center mt-6'>
                {!isLoading && tx && !error && (
                  <>
                    <span className='flex flex-col justify-center items-center mt-6'>
                      Successfully closed account
                      <a
                        className='text-blue-700 hover:underline my-3'
                        href={`https://solscan.io/tx/${tx}${
                          connection.rpcEndpoint.includes('devnet')
                            ? '?cluster=devnet'
                            : ''
                        }`}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {account} - View in Solscan
                      </a>
                    </span>
                  </>
                )}{' '}
                {!isLoading && error && (
                  <>
                    <span className='flex flex-col justify-center items-center mt-6'>
                      {error}
                    </span>
                  </>
                )}{' '}
                {!isLoading && !tx && !error && (
                  <>
                    <p className='font-bold text-lg'>Are you sure?</p>
                    <span className='flex gap-5 justify-center items-center mt-6'>
                      <button
                        className='p-2 font-semibold px-4 bg-red-500 rounded-lg text-white hover:scale-105 transition-transform duration-200 ease-in-out'
                        onClick={runCallback}
                      >
                        YES
                      </button>
                      <button
                        className='p-2 font-semibold  px-4 bg-red-500 rounded-lg text-white hover:scale-105 transition-transform duration-200 ease-in-out'
                        onClick={closeModal}
                      >
                        NO
                      </button>
                    </span>
                  </>
                )}{' '}
                {isLoading && (
                  <button
                    type='button'
                    className='inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md 
                    text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-not-allowed'
                    disabled={true}
                  >
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Removing account...
                  </button>
                )}
              </span>
            </span>
          </span>
        </div>
      )}
    </>
  );
};

export default Modal;
