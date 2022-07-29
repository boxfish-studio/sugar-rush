import { useNotification } from 'hooks'
import { Notification } from 'components'
import { INotification, NotificationType } from 'lib/interfaces'
import { CheckIcon, XIcon, AlertIcon, InfoIcon } from '@primer/octicons-react'
import { useEffect } from 'react'

export default function NotificationManager() {
    const { notifications, removeNotification } = useNotification()
    console.log('notifications', notifications)
    // useEffect(() => {
    //     if (notifications.length) {
    //         notifications.map((notification) => {
    //             setTimeout(() => {
    //                 removeNotification(notification)
    //             }, notification?.timeout)
    //         })
    //     }
    // }, [notifications])

    const onClose = (notification: INotification) => {
        removeNotification(notification)
    }
    const InfoNotification = (props: INotification) => {
        return <Notification {...props} type={NotificationType.Default} />
    }
    const ErrorNotification = (props: INotification) => {
        return <Notification {...props} type={NotificationType.Error} />
    }
    const WarningNotification = (props: INotification) => {
        return <Notification {...props} type={NotificationType.Warning} />
    }
    const SuccessNotification = (props: INotification) => {
        return <Notification {...props} type={NotificationType.Success} />
    }

    return (
        <div className='notifications'>
            {notifications?.map((notification, index) => {
                if (notification.type === NotificationType.Default) {
                    return (
                        <InfoNotification
                            key={index}
                            {...notification}
                            icon={InfoIcon}
                            onClose={() => onClose(notification)}
                        />
                    )
                }
                if (notification.type === NotificationType.Error) {
                    return (
                        <ErrorNotification
                            key={index}
                            {...notification}
                            icon={XIcon}
                            onClose={() => onClose(notification)}
                        />
                    )
                }
                if (notification.type === NotificationType.Warning) {
                    return (
                        <WarningNotification
                            key={index}
                            {...notification}
                            icon={AlertIcon}
                            onClose={() => onClose(notification)}
                        />
                    )
                }
                if (notification.type === NotificationType.Success) {
                    return (
                        <SuccessNotification
                            key={index}
                            {...notification}
                            icon={CheckIcon}
                            onClose={() => onClose(notification)}
                        />
                    )
                }
            })}
        </div>
    )
}
