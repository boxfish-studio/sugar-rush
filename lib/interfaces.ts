export interface INavbarElement {
    title: string
    url: string
    tooltip?: string
    disabled?: boolean
}

export interface INotification {
    open?: boolean
    title?: string
    type?: string
    message?: string
    onClose?: () => void
    timeout?: number
}
