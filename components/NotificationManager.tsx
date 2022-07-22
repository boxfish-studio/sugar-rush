import { useNotification } from 'hooks/useNotification'
import { Notification } from 'components'
import { NotificationProps } from 'lib/interfaces'

export default function NotificationManager() {
    const { notification, showNotification } = useNotification()
    const onClose = () => {
        showNotification({
            open: false,
        })
    }

    function InfoNotification(props: NotificationProps) {
        return <Notification {...props} type='default' />
    }
    function ErrorNotification(props: NotificationProps) {
        return <Notification {...props} type='danger' />
    }
    function WarningNotification(props: NotificationProps) {
        return <Notification {...props} type='warning' />
    }
    function SuccessNotification(props: NotificationProps) {
        return <Notification {...props} type='success' />
    }

    return (
        <div>
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
        </div>
    )
}
