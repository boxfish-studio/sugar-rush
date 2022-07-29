import { useRecoilState } from 'recoil'
import { notificationState } from 'lib/recoil-store/atoms'
import { INotification } from 'lib/interfaces'
import { useEffect } from 'react'
import { generateRandomId } from 'lib/utils'

export const NOTIFICATION_TIMEOUT_DEFAULT = 8000
export const NOTIFICATION_TIMEOUT_NEVER = -1

const useNotification = () => {
    const [notifications, setNotifications] = useRecoilState(notificationState)
    let currentNotifications: INotification[] = notifications

    const showNotification = (notification: INotification) => {
        if (!notification.id) {
            notification.id = generateRandomId()
            notification.timeout = notification.timeout ?? NOTIFICATION_TIMEOUT_DEFAULT
            currentNotifications = [...notifications, notification]
            console.log('currentNotifications after psuh', currentNotifications)
            setNotifications(currentNotifications)
        }
        if (notification.timeout !== NOTIFICATION_TIMEOUT_NEVER) {
            setTimeout(() => removeNotification(notification.id), notification.timeout)
        }

        return notification.id
    }

    function removeNotification(id: string | undefined): void {
        currentNotifications.filter((n) => n.id !== id)
        console.log('currentNotifications after remove', currentNotifications)
        setNotifications(currentNotifications)
    }

    useEffect(() => {
        if (notifications.length > 0) {
            notifications.map((notification) => {
                setTimeout(() => {
                    showNotification(notification)
                }, notification?.timeout)
            })
        }
        setNotifications(notifications)
        console.log('notifications after useEffect', notifications)
    }, [notifications])

    return { notifications, showNotification }
}
export default useNotification
