import { CandyMachineTile } from 'components'
import { FC, useState } from 'react'
import { Button, Spinner, Text } from '@primer/react'
import { useRemoveCandyMachineAccount } from 'hooks'

const DeleteCandyMachine: FC<{
    candyMachineAccount: string
}> = ({ candyMachineAccount }) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const [status, setStatus] = useState({ error: false, message: '' })
    const { removeAccount } = useRemoveCandyMachineAccount([candyMachineAccount])

    const deleteCM = async () => {
        try {
            setIsDeleting(true)
            setStatus({ error: false, message: '' })
            const result = await removeAccount(candyMachineAccount)
            console.log(result)
            setStatus({ error: false, message: `Candy Machine deleted successfully! ${result}` })
        } catch (error) {
            console.log(error)
            setStatus({ error: true, message: 'Delete was not successful.' })
        }
        setIsDeleting(false)
    }

    return (
        <>
            <div style={{ display: 'grid', gridRowGap: '16px' }}>
                <Text as='p'>Are you sure you want to delete candy machine {candyMachineAccount}</Text>
                {!isDeleting && status.message && (
                    <span
                        className={`border ${
                            status.error
                                ? 'color-fg-danger color-bg-danger color-border-danger'
                                : 'color-fg-success color-bg-success color-border-success'
                        } rounded-2 p-2`}
                    >
                        {status.message}
                    </span>
                )}
            </div>
            {!isDeleting && (
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
            {isDeleting && (
                <>
                    <Button className='width-full mt-4' isLoading disabled size='large'>
                        Deleting Candy Machine... <Spinner size='small' />
                    </Button>
                </>
            )}
        </>
    )
}

export default DeleteCandyMachine
