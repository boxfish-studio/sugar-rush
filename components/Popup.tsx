import { FC, useEffect } from 'react'
import { Box, StyledOcticon } from '@primer/react'
import { XCircleIcon } from '@primer/octicons-react'

const Popup: FC<{
    children: any
    title: string
    onClose: () => void
    size: 'small' | 'large'
}> = ({ children, title, onClose, size }) => {
    useEffect(() => {
        document.body.style.overflowY = 'hidden'
        return () => {
            document.body.style.overflowY = 'auto'
        }
    }, [])
    return (
        <>
            <div
                className='position-absolute width-full height-full top-0 left-0'
                style={{ background: 'rgba(0, 0, 0, 0.5)', zIndex: 9 }}
                onClick={onClose}
            />
            <Box
                className='position-fixed color-bg-default rounded-2'
                sx={{
                    zIndex: 10,
                    width: '100%',
                    maxWidth: size === 'large' ? '60vh' : '45vh',
                    minHeight: size === 'large' ? ['550px', '750px'] : ['200px'],
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <div className='p-3 p-md-5 d-flex flex-column'>
                    <div className='d-flex flex-justify-between text-bold'>
                        <h3 className='wb-break-word' style={{ width: '75%', flex: 1 }}>
                            {title}
                        </h3>
                        <div onClick={onClose} style={{ cursor: 'pointer' }}>
                            <StyledOcticon icon={XCircleIcon} size={25} />
                        </div>
                    </div>
                    <div className='mt-3 mt-md-5 height-full'>{children}</div>
                </div>
            </Box>
        </>
    )
}

export default Popup
