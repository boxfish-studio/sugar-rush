import { Flash, Text } from '@primer/react'
import { NotificationProps } from 'lib/interfaces'
import { StyledOcticon } from '@primer/react'
import { XCircleIcon } from '@primer/octicons-react'

export default function Notification(props: NotificationProps) {
    const { type, message, onClose, title } = props
    return (
        <div className='notification'>
            <Flash variant={type}>
                <div
                    className='width-full d-flex flex-items-center flex-justify-between mb-3'
                    title='Close'
                    onClick={onClose}
                >
                    <h4 className='wb-break-all mr-3'>{title}</h4>
                    <StyledOcticon icon={XCircleIcon} size={25} />
                </div>
                <div className='d-flex '>
                    <div className='f4'>{message}</div>
                </div>
            </Flash>
        </div>
    )
}
