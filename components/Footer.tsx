import Link from 'next/link'
import { FC } from 'react'
import version from '../version.json'

const Footer: FC = () => (
    <footer
        className='color-bg-emphasis color-fg-on-emphasis position-fixed bottom-0 left-0
      z-10 d-flex flex-row flex-justify-center flex-items-center py-3 px-6 width-full bg-gray-200'
    >
        <div>
            <Link
                href='https://github.com/boxfish-studio/sugar-rush/'
                target='_blank'
                rel='noopener noreferrer'
                className='color-fg-on-emphasis text-underline'
                style={{ cursor: 'pointer' }}
            >
                Sugar Rush {version.version}
            </Link>
            <span className='mr-1'> - by</span>
            <Link
                href='https://boxfish.studio/'
                legacyBehavior
                target='_blank'
                rel='noopener noreferrer'
                className='color-fg-on-emphasis text-underline'
                style={{ cursor: 'pointer' }}
            >
                Boxfish Studio
            </Link>
        </div>
    </footer>
)

export default Footer
