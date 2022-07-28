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

    const showNotification = (notification: INotification): string => {
        notification.id = generateRandomId()
        notification.timeout = notification.timeout ?? NOTIFICATION_TIMEOUT_DEFAULT
        currentNotifications = [...notifications, notification]
        console.log('currentNotifications after psuh', currentNotifications)
        setNotifications(currentNotifications)
        if (notification.timeout !== NOTIFICATION_TIMEOUT_NEVER) {
            setTimeout(() => removeNotification(notification.id), notification.timeout)
        }

        return notification.id
    }

    function removeNotification(id: string | undefined): void {
        let _currentNotifications = [...currentNotifications]
        const idx = _currentNotifications?.findIndex((n) => n.id === id)
        console.log('idx', idx)
        if (idx >= 0) {
            console.log('removing notification', idx)
            _currentNotifications.splice(idx, 1)
        }
        _currentNotifications = currentNotifications
        // setNotifications(_currentNotifications)
        setNotifications(currentNotifications)
    }

    useEffect(() => {
        if (currentNotifications.length > 0) {
            currentNotifications.map((notification) => {
                if (notification?.open && notification?.timeout) {
                    setTimeout(() => {
                        showNotification(notification)
                    }, notification?.timeout)
                }
            })
        }
    }, [currentNotifications])

    return { currentNotifications, showNotification }
}
export default useNotification
