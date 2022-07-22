export interface ICarousel {
    title: string
    image: string
}
export interface INavbarElement {
    title: string
    url: string
    tooltip?: string
    disabled?: boolean
}

export interface NotificationState {
    open: boolean
    message: string
    type: string
    timeout: number
    title: string
}

export interface NotificationProps {
    type?: string
    message?: string
    onClose?: () => void
    open?: boolean
    timeout?: number
    title?: string
}
