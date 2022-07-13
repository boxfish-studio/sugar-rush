import Link from 'next/link'
import { FC } from 'react'

const Footer: FC = () => {
    return (
        <footer
            className='color-bg-emphasis color-fg-on-emphasis position-fixed bottom-0 left-0
      z-10 d-flex flex-row flex-justify-center flex-items-center py-3 px-6 width-full bg-gray-200'
        >
            <div>
                <span className='mr-1'>Made by</span>
                <Link href='https://boxfish.studio/'>
                    <span className='color-fg-on-emphasis text-underline' style={{ cursor: 'pointer' }}>
                        Boxfish Studio
                    </span>
                </Link>
            </div>
        </footer>
    )
}

export default Footer
