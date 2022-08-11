import { INotification, NotificationType } from 'lib/interfaces'
import { notificationState } from 'lib/recoil-store/atoms'
import { generateRandomId } from 'lib/utils'
import { useRecoilState } from 'recoil'
import { NOTIFICATION_TIMEOUT_DEFAULT } from 'lib/constants'
import { CandyMachineAction } from 'lib/candy-machine/enums'

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

    const populateNotificationError = (action: CandyMachineAction, newError: string) => {
        addNotification({
            message: `There was an error ${action} the candy machine \n` + newError,
            type: NotificationType.Error,
        })
    }

    return { notifications, addNotification, removeNotification, populateNotificationError }
}
export default useNotification
