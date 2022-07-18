import { FC } from 'react'
import { Button } from '@primer/react'
import { SyncIcon } from '@primer/octicons-react'

const RefreshButton: FC<{
    isLoading: boolean
    onClick: () => void
}> = ({ isLoading, onClick }) => {
    return (
        <Button className={isLoading ? 'loading-animation' : ''} leadingIcon={SyncIcon} onClick={onClick}>
            Refresh
        </Button>
    )
}
export default RefreshButton
