import Link from 'next/link'
import { FC, useEffect, useState } from 'react'

const Footer: FC = () => {
    const [version, setVersion] = useState('')
    const getVersion = async (file: string) => {
        try {
            const response = await fetch(file)
            await response
                .json()
                .then((version) => setVersion(version[0].name))
                .catch(() => setVersion('v0.0.0'))
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        getVersion('tag_version.txt')
    }, [])

    return (
        <footer
            className='color-bg-emphasis color-fg-on-emphasis position-fixed bottom-0 left-0
      z-10 d-flex flex-row flex-justify-center flex-items-center py-3 px-6 width-full bg-gray-200'
        >
            <div>
                <Link href='https://github.com/boxfish-studio/sugar-rush/'>
                    <a
                        target='_blank'
                        rel='noopener noreferrer'
                        className='color-fg-on-emphasis text-underline'
                        style={{ cursor: 'pointer' }}
                    >
                        Sugar Rush {version}
                    </a>
                </Link>
                <span className='mr-1'> - by</span>
                <Link href='https://boxfish.studio/'>
                    <a
                        target='_blank'
                        rel='noopener noreferrer'
                        className='color-fg-on-emphasis text-underline'
                        style={{ cursor: 'pointer' }}
                    >
                        Boxfish Studio
                    </a>
                </Link>
            </div>
        </footer>
    )
}

export default Footer
