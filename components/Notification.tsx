import { XCircleIcon } from '@primer/octicons-react'
import { Flash, StyledOcticon } from '@primer/react'
import { useNotification } from 'hooks'
import { NOTIFICATION_TIMEOUT_NEVER } from 'lib/constants'
import { INotification } from 'lib/interfaces'
import { FC, useEffect, useRef } from 'react'

function useRemoveNotification({ id, timeout }: INotification) {
    const flash = useRef<HTMLDivElement>(null)
    const { removeNotification, setStyles } = useNotification(flash)

    useEffect(() => {
        if (timeout !== NOTIFICATION_TIMEOUT_NEVER) {
            const destroyTimeout = setTimeout(() => removeNotification(id!), timeout)
            return () => clearTimeout(destroyTimeout)
        }
    }, [])

    useEffect(() => {
        if (timeout !== NOTIFICATION_TIMEOUT_NEVER) {
            const destroyTimeout = setTimeout(() => {
                setStyles(flash)
            }, timeout! - 500)

            return () => clearTimeout(destroyTimeout)
        }
    }, [])

    const onClose = (id: string) => {
        removeNotification(id)
    }

    return {
        flash,
        onClose,
    }
}

const Notification: FC<INotification> = ({ type, message, icon, timeout, id }) => {
    const { flash, onClose } = useRemoveNotification({ id, timeout })

    return (
        <Flash
            variant={type}
            ref={flash}
            id='notification'
            style={{ '--data-timeout': `${timeout}ms` } as React.CSSProperties}
        >
            <div className='d-flex flex-justify-between'>
                <div className='mr-3 d-flex width-full flex-items-center'>
                    <StyledOcticon icon={icon} />
                    <div className='f4 wb-break-word'>{message}</div>
                </div>
                <div
                    className='d-flex flex-items-center flex-justify-end cursor-pointer'
                    title='Close'
                    onClick={() => onClose(id!)}
                >
                    <StyledOcticon icon={XCircleIcon} size={16} />
                </div>
            </div>
        </Flash>
    )
}
export default Notification
