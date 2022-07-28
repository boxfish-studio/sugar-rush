export interface INavbarElement {
    title: string
    url: string
    tooltip?: string
    disabled?: boolean
}

export interface INotification {
    open?: boolean
    icon?: any
    type?: NotificationType
    message?: string
    onClose?: () => void
    timeout?: number
    id?: string
}

export enum NotificationType {
    Default = 'default',
    Success = 'success',
    Error = 'danger',
    Warning = 'warning',
}
