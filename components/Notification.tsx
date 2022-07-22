import { Flash, Text } from '@primer/react'
import { NotificationProps } from 'lib/interfaces'
import { StyledOcticon } from '@primer/react'
import { XCircleIcon } from '@primer/octicons-react'

export default function Notification(props: NotificationProps) {
    const { type, message, onClose, title } = props
    return (
        <div className='notification'>
            <Flash variant={type}>
                <div className='d-flex width-full flex-items-center flex-justify-between'>
                    <div className='mr-3'>
                        <div className='wb-break-all f5 mb-2'>{title}</div>
                        <div className='f4'>{message}</div>
                    </div>
                    <div className=' d-flex flex-items-center flex-justify-between' title='Close' onClick={onClose}>
                        <StyledOcticon icon={XCircleIcon} size={16} />
                    </div>
                </div>
            </Flash>
        </div>
    )
}
