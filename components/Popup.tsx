import { FC } from 'react'
import Image from 'next/image'
import { Box, Button } from '@primer/react'

const Popup: FC<{
    children: any
    title: string
    onClose: () => void
    size: 'small' | 'large'
}> = ({ children, title, onClose, size }) => {
    return (
        <div
            className='position-absolute width-full height-full top-0 left-0'
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
            <Box
                className='position-fixed color-bg-inset rounded-2'
                sx={{
                    zIndex: 10,
                    width: '100%',
                    maxWidth: '60vh',
                    height: '100%',
                    maxHeight: size === 'large' ? ['550px', '750px'] : ['50%'],
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <div className='p-3 p-md-5 d-flex flex-column height-full flex-justify-between'>
                    <div className='d-flex flex-justify-between text-bold'>
                        <h3>{title}</h3>
                        <Image
                            src='/close.svg'
                            alt='close'
                            width={22}
                            height={22}
                            onClick={onClose}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>
                    <div className='mt-5'>{children}</div>
                </div>
            </Box>
        </div>
    )
}

export default Popup
