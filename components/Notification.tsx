import { Flash } from '@primer/react'
import { INotification } from 'lib/interfaces'
import { StyledOcticon } from '@primer/react'
import { XCircleIcon } from '@primer/octicons-react'
import { FC, useEffect } from 'react'
import { useNotification } from 'hooks'
import { NOTIFICATION_TIMEOUT_DEFAULT, NOTIFICATION_TIMEOUT_NEVER } from 'lib/constants'

const Notification: FC<INotification> = ({ type, message, onClose, icon, timeout, id }) => {
    const { removeNotification } = useNotification()

    useEffect(() => {
        if (!timeout || timeout !== NOTIFICATION_TIMEOUT_NEVER) {
            const destroyTimeout = setTimeout(() => removeNotification(id!), timeout ?? NOTIFICATION_TIMEOUT_DEFAULT)
            return () => clearTimeout(destroyTimeout)
        }
    }, [])

    return (
        <Flash variant={type}>
            <div className='d-flex flex-justify-between'>
                <div className='mr-3 d-flex width-full flex-items-center'>
                    <StyledOcticon icon={icon} />
                    <div className='f4 wb-break-word'>{message}</div>
                </div>
                <div
                    className='d-flex flex-items-center flex-justify-end cursor-pointer'
                    title='Close'
                    onClick={onClose}
                >
                    <StyledOcticon icon={XCircleIcon} size={16} />
                </div>
            </div>
        </Flash>
    )
}
export default Notification
