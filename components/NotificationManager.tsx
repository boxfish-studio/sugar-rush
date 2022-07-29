import { useNotification } from 'hooks'
import { Notification } from 'components'
import { INotification, NotificationType } from 'lib/interfaces'
import { CheckIcon, XIcon, AlertIcon, InfoIcon } from '@primer/octicons-react'

export default function NotificationManager() {
    const { notifications } = useNotification()

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
        <>
            {notifications?.map((notification) => {
                return (
                    <>
                        {notification.type === NotificationType.Default && notification.open && (
                            <InfoNotification message={notification.message} icon={InfoIcon} />
                        )}
                        {notification.type === NotificationType.Error && notification.open && (
                            <ErrorNotification message={notification.message} icon={XIcon} />
                        )}
                        {notification.type === NotificationType.Warning && notification.open && (
                            <WarningNotification message={notification.message} icon={AlertIcon} />
                        )}
                        {notification.type === NotificationType.Success && notification.open && (
                            <SuccessNotification message={notification.message} icon={CheckIcon} />
                        )}
                    </>
                )
            })}
        </>
    )
}
