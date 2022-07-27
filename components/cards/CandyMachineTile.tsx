import { FC } from 'react'
import Link from 'next/link'
import { Button } from '@primer/react'
import { LinkExternalIcon } from '@primer/octicons-react'
import { useRPC } from 'hooks'

const CandyMachineTile: FC<{
    account: string
}> = ({ account }) => {
    const { isDevnet } = useRPC()
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
                    <Link href={`https://solscan.io/account/${account}?${isDevnet}`}>
                        <a target='_blank'>
                            <Button leadingIcon={LinkExternalIcon}>View in Solscan</Button>
                        </a>
                    </Link>
                    <Link href={`/candy-machines/${account}`}>
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
