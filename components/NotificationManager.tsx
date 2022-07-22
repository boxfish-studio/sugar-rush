import { useNotification } from 'hooks'
import { Notification } from 'components'
import { INotification } from 'lib/interfaces'

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
                <InfoNotification message={notification.message} title={notification.title} onClose={() => onClose()} />
            )}
            {notification.type === 'danger' && notification.open && (
                <ErrorNotification
                    message={notification.message}
                    title={notification.title}
                    onClose={() => onClose()}
                />
            )}
            {notification.type === 'warning' && notification.open && (
                <WarningNotification
                    message={notification.message}
                    title={notification.title}
                    onClose={() => onClose()}
                />
            )}
            {notification.type === 'success' && notification.open && (
                <SuccessNotification
                    message={notification.message}
                    title={notification.title}
                    onClose={() => onClose()}
                />
            )}
        </>
    )
}
