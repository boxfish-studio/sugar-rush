export interface INavbarElement {
    title: string
    url: string
    tooltip?: string
    disabled?: boolean
}

export interface INotification {
    id?: string
    icon?: any
    type?: NotificationType
    message?: string
    timeout?: number
    onClose?: () => void
}

export enum NotificationType {
    Default = 'default',
    Success = 'success',
    Error = 'danger',
    Warning = 'warning',
}
