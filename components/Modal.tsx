import { Dispatch, FC, SetStateAction, useState } from 'react'
import styles from 'styles/modules/Modal.module.scss'
import { Box, Button } from '@primer/react'
import { Dialog } from '@primer/react/drafts'

const Modal: FC<{
    isOpen: boolean
    setIsOpen: Dispatch<SetStateAction<boolean>>
    children: any
    title: string
    onClick: () => void
}> = ({ isOpen, setIsOpen, children, title, onClick }) => {
    return (
        <>
            {isOpen && (
                <Dialog
                    title={title}
                    onClose={() => setIsOpen(false)}
                    aria-labelledby='label'
                    footerButtons={[{ content: 'Ok', onClick: onClick }]}
                    height='large'
                    width='auto'
                >
                    <Box p={3}>{children}</Box>
                </Dialog>
            )}
        </>
    )
}

export default Modal
