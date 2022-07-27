import { FC, useEffect, useState } from 'react'
import { Button, Spinner } from '@primer/react'
import { useUploadCache, useVerifyCandyMachineV2 } from 'hooks'

const VerifyCandyMachine: FC<{
    candyMachineAccount: string
}> = ({ candyMachineAccount }) => {
    const [isVerifying, setIsVerifying] = useState(false)
    const { cache, uploadCache } = useUploadCache()
    const { setError, error, verifyCandyMachine, message } = useVerifyCandyMachineV2(cache)

    const verifyCM = async () => {
        try {
            setIsVerifying(true)
            await verifyCandyMachine({ candyMachineAccount })
        } catch (error) {
            console.log(error)
        }
        setIsVerifying(false)
    }

    useEffect(() => {
        setError('')
    }, [cache])

    return (
        <>
            <div className='d-flex flex-column flex-justify-between height-full'>
                <div>
                    <h3 className='wb-break-all f3'>{candyMachineAccount}</h3>
                    <div className='mt-2'>
                        <span>{cache?.name}</span>
                    </div>
                    <div className='my-3 my-md-5'>
                        <label
                            htmlFor='cache'
                            className='px-4 py-2 rounded-2 cursor-pointer'
                            style={{ border: '1px solid #1b1f2426' }}
                        >
                            Upload cache file
                        </label>
                        <input
                            id='cache'
                            type='file'
                            name='cache'
                            multiple
                            onChange={uploadCache}
                            className='d-none'
                            required
                        />
                    </div>

                    {!isVerifying && message && (
                        <>
                            <span className='bordercolor-fg-success color-bg-success color-border-success rounded-2 p-2'>
                                {message}
                            </span>
                        </>
                    )}
                    {!isVerifying && error && (
                        <div className='border color-fg-danger color-bg-danger color-border-danger rounded-2 p-2'>
                            <span>{error}</span>
                        </div>
                    )}
                </div>
                {!isVerifying && (
                    <Button
                        className={`width-full ${message || error ? 'mt-3' : 'mt-0'}`}
                        variant='primary'
                        state='rest'
                        size='medium'
                        onClick={() => verifyCM()}
                    >
                        Verify candy machine
                    </Button>
                )}
                {isVerifying && (
                    <>
                        <Button className='width-full mt-4' size='medium' isLoading disabled>
                            Verifying Candy Machine... <Spinner size='small' />
                        </Button>
                    </>
                )}
            </div>
        </>
    )
}

export default VerifyCandyMachine
