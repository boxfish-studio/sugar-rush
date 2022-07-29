import { useRecoilState } from 'recoil'
import { notificationState } from 'lib/recoil-store/atoms'
import { INotification } from 'lib/interfaces'
import { generateRandomId } from 'lib/utils'

const useNotification = () => {
    const [notifications, setNotifications] = useRecoilState<INotification[]>(notificationState)

    const createNotification = (notification: INotification): void => {
        const id = notification.id ?? generateRandomId()
        setNotifications([...notifications, { ...notification, id }])
    }

    const removeNotification = (id: string): void => {
        const _notifications = notifications.filter((n) => n.id !== id)
        setNotifications(_notifications)
    }

    return { notifications, createNotification, removeNotification }
}
export default useNotification
