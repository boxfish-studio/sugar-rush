import { useRecoilState } from 'recoil'
import { notificationState } from 'lib/recoil-store/atoms'
import { INotification } from 'lib/interfaces'
import { useEffect } from 'react'

export const NOTIFICATION_TIMEOUT_DEFAULT = 8000
export const NOTIFICATION_TIMEOUT_NEVER = -1

const useNotification = () => {
    const [notifications, setNotifications] = useRecoilState<INotification[]>(notificationState)

    const showNotification = (notification: INotification): void => {
        setNotifications([...notifications, { ...notification }])
    }

    const removeNotification = (notification: INotification): void => {
        setNotifications(notifications.filter((n) => n !== notification))
    }

    useEffect(() => {
        if (notifications?.length) {
            notifications.forEach((notification) => {
                setTimeout(() => {
                    removeNotification(notification)
                }, notification?.timeout)
            })
        }
    }, [notifications])

    return { notifications, showNotification, removeNotification }
}
export default useNotification
