export interface INavbarElement {
    title: string
    url: string
    tooltip?: string
    disabled?: boolean
}

export interface INotification {
    open?: boolean
    title?: string
    type?: 'default' | 'success' | 'danger' | 'warning'
    message?: string
    onClose?: () => void
    timeout?: number
}
