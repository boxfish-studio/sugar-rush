import { useNotification } from 'hooks'
import { Notification } from 'components'
import { INotification } from 'lib/interfaces'
import { CheckIcon, XIcon, AlertIcon, InfoIcon } from '@primer/octicons-react'

export default function NotificationManager() {
    const { notification, showNotification } = useNotification()
    const onClose = () => {
        showNotification({
            open: false,
        })
    }

    const InfoNotification = (props: INotification) => {
        return <Notification {...props} type='default' />
    }
    const ErrorNotification = (props: INotification) => {
        return <Notification {...props} type='danger' />
    }
    const WarningNotification = (props: INotification) => {
        return <Notification {...props} type='warning' />
    }
    const SuccessNotification = (props: INotification) => {
        return <Notification {...props} type='success' />
    }

    return (
        <>
            {notification.type === 'default' && notification.open && (
                <InfoNotification message={notification.message} onClose={() => onClose()} icon={InfoIcon} />
            )}
            {notification.type === 'danger' && notification.open && (
                <ErrorNotification message={notification.message} onClose={() => onClose()} icon={XIcon} />
            )}
            {notification.type === 'warning' && notification.open && (
                <WarningNotification message={notification.message} onClose={() => onClose()} icon={AlertIcon} />
            )}
            {notification.type === 'success' && notification.open && (
                <SuccessNotification message={notification.message} onClose={() => onClose()} icon={CheckIcon} />
            )}
        </>
    )
}
