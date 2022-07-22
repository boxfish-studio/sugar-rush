import { useRecoilState } from 'recoil'
import { notificationState } from 'lib/recoil-store/atoms'
import { INotification } from 'lib/interfaces'
import { useEffect } from 'react'

const useNotification = () => {
    const [notification, setNotification] = useRecoilState<INotification>(notificationState)
    const showNotification = (props: INotification) => {
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
            // notification?.timeout)
        }
    }, [notification?.open, notification?.timeout])
    return { notification, showNotification }
}
export default useNotification
