import { INotification } from 'lib/interfaces'
import { notificationState } from 'lib/recoil-store/atoms'
import { generateRandomId } from 'lib/utils'
import { useRecoilState } from 'recoil'
import { NOTIFICATION_TIMEOUT_DEFAULT } from 'lib/constants'

const useNotification = () => {
    const [notifications, setNotifications] = useRecoilState<INotification[]>(notificationState)

    const addNotification = (notification: INotification): void => {
        const id = notification?.id ?? generateRandomId()
        const timeout = notification?.timeout ?? NOTIFICATION_TIMEOUT_DEFAULT
        setNotifications((notificationsPrev) => [...notificationsPrev, { ...notification, id, timeout }])
    }

    const removeNotification = (id: string): void => {
        setNotifications((notificationsPrev) => notificationsPrev.filter((n) => n.id !== id))
    }

    return { notifications, addNotification, removeNotification }
}
export default useNotification
