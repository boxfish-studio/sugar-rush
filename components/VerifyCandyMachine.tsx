import { FC, useState } from 'react'
import { Button, Spinner } from '@primer/react'
import { useUploadCache, useVerifyCandyMachineV2 } from 'hooks'
import { useRouter } from 'next/router'

const VerifyCandyMachine: FC<{
    candyMachineAccount: string
}> = ({ candyMachineAccount }) => {
    const [isVerifying, setIsVerifying] = useState(false)
    const { cache, uploadCache } = useUploadCache()
    const { error, verifyCandyMachine, message } = useVerifyCandyMachineV2(cache)
    const router = useRouter()

    const verifyCM = async () => {
        try {
            setIsVerifying(true)
            await verifyCandyMachine({ candyMachineAccount })
        } catch (error) {
            console.log(error)
        }
        setIsVerifying(false)
    }

    return (
        <>
            <div style={{ display: 'grid' }}>
                <div>
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
                        <span
                            className={`border ${
                                error
                                    ? 'color-fg-danger color-bg-danger color-border-danger'
                                    : 'color-fg-success color-bg-success color-border-success'
                            } rounded-2 p-2 mt-4`}
                        >
                            {message}
                        </span>
                    </>
                )}
            </div>
            {!isVerifying && (
                <Button
                    className={`width-full ${message ? 'mt-3' : 'mt-5'}`}
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
                    <Button className='width-full mt-4' isLoading disabled size='large'>
                        Verifying Candy Machine... <Spinner size='small' />
                    </Button>
                </>
            )}
        </>
    )
}

export default VerifyCandyMachine
