import { Title } from 'components'
import { FC } from 'react'

const CheckConnectedWallet: FC = () => {
    return (
        <div className='flex justify-center items-center flex-col gap-4'>
            <div className='mt-28 flex justify-center items-center flex-col gap-4'>
                <Title text='Please connect your wallet.' />
            </div>
        </div>
    )
}

export default CheckConnectedWallet
