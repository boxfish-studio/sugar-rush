import { Button } from '@primer/react'
import Link from 'next/link'
import { FC } from 'react'
import { LinkExternalIcon } from '@primer/octicons-react'

const CandyMachineTile: FC<{
    account: string
}> = ({ account }) => {
    return (
        <>
            <div
                key={account}
                className='border rounded-2 py-3 px-4 d-flex flex-column flex-md-row flex-justify-between flex-items-start flex-md-items-center width-full'
            >
                <span className='wb-break-all f5 lh-condensed' style={{ letterSpacing: '-0.15px' }}>
                    {account}
                </span>
                <div className='d-flex mt-2 mt-md-0 '>
                    <Link href={`/${account}`}>
                        <Button leadingIcon={LinkExternalIcon}>View in Solscan</Button>
                    </Link>
                    <Link href={`/${account}`}>
                        <Button variant='outline' sx={{ ml: '16px' }}>
                            Inspect
                        </Button>
                    </Link>
                </div>
            </div>
        </>
    )
}

export default CandyMachineTile
