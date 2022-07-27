import { ExplorerLinks } from 'components'
import { FC, useState } from 'react'
import { Button, Spinner, Text } from '@primer/react'
import { useRemoveCandyMachineAccount } from 'hooks'
import { useRouter } from 'next/router'

const DeleteCandyMachine: FC<{
    candyMachineAccount: string
}> = ({ candyMachineAccount }) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const [status, setStatus] = useState({ error: false, message: '' })
    const [transaction, setTransaction] = useState('')
    const { removeAccount } = useRemoveCandyMachineAccount([candyMachineAccount])
    const router = useRouter()

    const deleteCM = async () => {
        try {
            setIsDeleting(true)
            setStatus({ error: false, message: '' })
            const result = await removeAccount(candyMachineAccount)
            result && setTransaction(result.txid)
            setStatus({ error: false, message: `Candy Machine deleted successfully!` })
        } catch (error) {
            console.log(error)
            setStatus({ error: true, message: 'Delete was not successful.' })
        }
        setIsDeleting(false)
    }

    return (
        <>
            <div className='d-flex flex-column flex-justify-between height-full'>
                <div>
                    <Text as='p'>Are you sure you want to delete candy machine</Text>
                    <Text as='p' className='wb-break-all'>
                        {candyMachineAccount}
                    </Text>
                </div>
                {!isDeleting && status.message && (
                    <>
                        <span
                            className={`border ${
                                status.error
                                    ? 'color-fg-danger color-bg-danger color-border-danger'
                                    : 'color-fg-success color-bg-success color-border-success'
                            } rounded-2 p-2`}
                        >
                            {status.message}
                        </span>
                        {!status.error && (
                            <div className='mt-3'>
                                <ExplorerLinks type='transaction' value={transaction} text={'Check tx'} />
                            </div>
                        )}
                    </>
                )}

                {!isDeleting && !transaction && (
                    <Button
                        className={`width-full ${status.message ? 'mt-3' : 'mt-5'}`}
                        variant='danger'
                        state='rest'
                        size='medium'
                        onClick={() => deleteCM()}
                    >
                        Delete candy machine
                    </Button>
                )}
                {!isDeleting && !!transaction && (
                    <Button
                        className='width-full mt-3'
                        variant='outline'
                        state='rest'
                        size='medium'
                        onClick={() => router.push('/candy-machines')}
                    >
                        Go Home
                    </Button>
                )}
                {isDeleting && (
                    <>
                        <Button size='medium' className='width-full mt-4' isLoading disabled>
                            Deleting Candy Machine... <Spinner size='small' />
                        </Button>
                    </>
                )}
            </div>
        </>
    )
}

export default DeleteCandyMachine
