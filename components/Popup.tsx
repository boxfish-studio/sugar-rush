import { Dispatch, FC, SetStateAction } from 'react'
import { Box } from '@primer/react'
import { Dialog } from '@primer/react/drafts'

const Popup: FC<{
    setIsOpen: Dispatch<SetStateAction<boolean>>
    children: any
    title: string
    onClick: () => void
    buttonLabel?: string
    buttonType?: 'primary' | 'danger'
}> = ({ setIsOpen, children, title, onClick, buttonLabel, buttonType }) => {
    return (
        <>
            <Dialog
                title={title}
                onClose={() => setIsOpen(false)}
                aria-labelledby='label'
                footerButtons={[{ content: buttonLabel, onClick: onClick, buttonType: buttonType }]}
                height='large'
                width='xlarge'
            >
                <Box p={3}>{children}</Box>
            </Dialog>
        </>
    )
}

export default Popup
