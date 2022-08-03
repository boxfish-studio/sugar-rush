import { XCircleIcon } from '@primer/octicons-react'
import { Flash, StyledOcticon } from '@primer/react'
import { useNotification } from 'hooks'
import { NOTIFICATION_TIMEOUT_NEVER } from 'lib/constants'
import { INotification } from 'lib/interfaces'
import { FC, useEffect, useRef } from 'react'

const styles = Object.freeze({
    opacity: '0',
    transform: 'translateY(-50%)',
    transition: 'all 0.5s',
})

const Notification: FC<INotification> = ({ type, message, onClose, icon, timeout, id }) => {
    const { removeNotification } = useNotification()
    const flash = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (timeout !== NOTIFICATION_TIMEOUT_NEVER) {
            const destroyTimeout = setTimeout(() => removeNotification(id!), timeout)
            return () => clearTimeout(destroyTimeout)
        }
    }, [])

    useEffect(() => {
        if (timeout !== NOTIFICATION_TIMEOUT_NEVER) {
            const l = setTimeout(() => {
                const style = flash.current?.style!
                style.transition = styles.transition
                style.transform = styles.transform
                style.opacity = styles.opacity
            }, timeout! - 500)

            return () => clearTimeout(l)
        }
    }, [])

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
                    onClick={onClose}
                >
                    <StyledOcticon icon={XCircleIcon} size={16} />
                </div>
            </div>
        </Flash>
    )
}
export default Notification
