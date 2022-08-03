import { AlertIcon, CheckIcon, InfoIcon, XIcon } from '@primer/octicons-react'
import { Notification } from 'components'
import { useNotification } from 'hooks'
import { INotification, NotificationType } from 'lib/interfaces'

export default function NotificationManager() {
    const { notifications, removeNotification } = useNotification()

    const onClose = (notification: INotification) => {
        removeNotification(notification.id!)
    }

    function getNotificationIcon(type: NotificationType | undefined) {
        switch (type) {
            case NotificationType.Error:
                return XIcon
            case NotificationType.Success:
                return CheckIcon
            case NotificationType.Warning:
                return AlertIcon
            case NotificationType.Default:
            default:
                return InfoIcon
        }
    }

    return (
        <div className='notifications'>
            {notifications?.map((notification) => {
                return (
                    <Notification
                        key={`notification-${notification.id}`}
                        {...notification}
                        icon={getNotificationIcon(notification?.type)}
                        onClose={() => onClose(notification)}
                    />
                )
            })}
        </div>
    )
}
