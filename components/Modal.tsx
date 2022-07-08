import { useConnection } from '@solana/wallet-adapter-react'
import { Button, ExplorerLinks } from 'components'
import { Dispatch, FC, SetStateAction, useState } from 'react'
import styles from 'styles/modules/Modal.module.scss'

const Modal: FC<{
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
    account: string
    callback: (account: string) => Promise<{ txid: string; balanceChange: number } | undefined>
}> = ({ isOpen, setIsOpen, callback, account }) => {
    const { connection } = useConnection()

    const [isLoading, setIsLoading] = useState(false)
    const [tx, setTx] = useState<{ txid: string; balanceChange: number }>()
    const [error, setError] = useState('')

    function handleModal(e: any) {
        const target = e.target as HTMLDivElement
        if (target.nodeName === 'DIV') closeModal()
    }
    function closeModal() {
        setIsOpen(false)
        setIsLoading(false)
        setTx(undefined)
        setError('')
    }

    async function runCallback() {
        try {
            setIsLoading(true)
            const tx = await callback(account)
            setIsLoading(false)
            if (!tx) return setError('Error: No transaction returned')
            setTx(tx)
        } catch (e) {
            closeModal()
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
                            <ExplorerLinks type='account' value={account} connection={connection} text={'View'} />
                            <h1 className='text-red-500 text-xl'>
                                <span className='font-bold'>WARNING!</span> You are attempting to remove an account from
                                the Candy Machine. This means all the unminted NFTs will be gone forever. This will
                                refund the SOL locked from the account to your wallet.
                            </h1>

                            <span className='flex flex-col  justify-center items-center'>
                                {!isLoading && tx && !error && (
                                    <>
                                        <span className='flex flex-col justify-center items-center mt-6'>
                                            Successfully closed account - Reedemed {tx.balanceChange.toFixed(4)} SOL
                                            <ExplorerLinks
                                                type='transaction'
                                                value={tx.txid}
                                                connection={connection}
                                                text={'Check the details'}
                                            />
                                        </span>
                                    </>
                                )}{' '}
                                {!isLoading && error && (
                                    <>
                                        <span className='flex flex-col justify-center items-center mt-6'>{error}</span>
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
                                {isLoading && <Button text='Removing account...' isLoading={true} />}
                            </span>
                        </span>
                    </span>
                </div>
            )}
        </>
    )
}

export default Modal
