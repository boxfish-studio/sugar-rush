import { INotification } from 'lib/interfaces'
import { notificationState } from 'lib/recoil-store/atoms'
import { generateRandomId } from 'lib/utils'
import { useRecoilState } from 'recoil'
import { NOTIFICATION_TIMEOUT_DEFAULT } from 'lib/constants'
import { MutableRefObject } from 'react'

const styles = Object.freeze({
    opacity: '0',
    transform: 'translateY(-50%)',
    transition: 'all 0.5s',
})

function useNotification<T extends HTMLElement>(element?: MutableRefObject<T | null>) {
    const [notifications, setNotifications] = useRecoilState<INotification[]>(notificationState)

    const addNotification = (notification: INotification): void => {
        const id = notification?.id ?? generateRandomId()
        const timeout = notification?.timeout ?? NOTIFICATION_TIMEOUT_DEFAULT
        setNotifications((notificationsPrev) => [...notificationsPrev, { ...notification, id, timeout }])
    }
    const setStyles = (element: MutableRefObject<T | null>) => {
        if (element?.current) {
            const style = element.current.style!
            style.transition = styles.transition
            style.transform = styles.transform
            style.opacity = styles.opacity
        }
    }
    const removeNotification = (id: string): void => {
        if (element) {
            setStyles(element)
            setTimeout(() => {
                setNotifications((notificationsPrev) => notificationsPrev.filter((n) => n.id !== id))
            }, 500)
            return
        }
        setNotifications((notificationsPrev) => notificationsPrev.filter((n) => n.id !== id))
    }

    return { notifications, addNotification, removeNotification, setStyles }
}
export default useNotification
