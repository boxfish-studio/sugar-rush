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
        <div
            className='position-absolute width-full height-full top-0 left-0'
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
            <Box
                className='position-fixed color-bg-inset rounded-2'
                sx={{
                    zIndex: 10,
                    width: '100%',
                    maxWidth: size === 'large' ? '60vh' : '45vh',
                    height: '100%',
                    maxHeight: size === 'large' ? ['550px', '750px'] : ['40%', '27.5%'],
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <div className='p-3 p-md-5 d-flex flex-column height-full'>
                    <div className='d-flex flex-justify-between text-bold'>
                        <h3>{title}</h3>
                        <div onClick={onClose} style={{ cursor: 'pointer' }}>
                            <StyledOcticon icon={XCircleIcon} size={25} />
                        </div>
                    </div>
                    <div className='mt-5'>{children}</div>
                </div>
            </Box>
        </div>
    )
}

export default Popup
