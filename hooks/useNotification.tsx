import { useRecoilState } from 'recoil'
import { notificationState } from '../lib/recoil-store/atoms'
import { NotificationProps, NotificationState } from 'lib/interfaces'
import { useEffect } from 'react'

export function useNotification() {
    const [notification, setNotification] = useRecoilState<NotificationState>(notificationState)
    const showNotification = (props: NotificationProps) => {
        setNotification({
            ...notification,
            ...props,
        })
    }
    useEffect(() => {
        if (notification?.open && notification?.timeout) {
            setTimeout(() => {
                showNotification({
                    open: false,
                })
            }, 500000)
            // notification?.timeout);
        }
    }, [notification?.open, notification?.timeout])
    return { notification, showNotification }
}
