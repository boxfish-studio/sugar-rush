import { useWallet } from '@solana/wallet-adapter-react'
import Link from 'next/link'
import { FC } from 'react'

interface INavbarElement {
    title: string
    url: string
    tooltip?: string
    disabled?: boolean
}

const Navbar: FC = () => {
    const { publicKey } = useWallet()

    const NAVBAR_ELEMENTS: INavbarElement[] = [
        {
            title: 'Manage CMs',
            url: '/',
            tooltip: 'Manage Candy Machines',
        },
        {
            title: 'Create CMs',
            url: '/create-candy-machine',
            tooltip: 'Create Candy Machine',
        },
    ]

    return (
        <nav
            className='
                fixed top-0 left-0 z-10 
                flex flex-row md:flex-col md:justify-between py-4 px-6
                md:h-screen w-screen md:w-48 
                bg-gray-200
            '
        >
            <div className='w-full'>
                <h4 className='uppercase mb-6'>Sugar Rush</h4>
                <div className='w-full flex flex-row md:flex-col space-x-4 md:space-x-0 md:space-y-4'>
                    {NAVBAR_ELEMENTS.map((element) => {
                        return <NavbarElement disabled={!publicKey} key={element.url} {...element} />
                    })}
                </div>
            </div>
            <p className='text-left text-xs'>
                By{' '}
                <a href='https://boxfish.studio' target='_blank' rel='noopener noreferrer'>
                    Boxfish Studio
                </a>
            </p>
        </nav>
    )
}

const NavbarElement = ({ title, url, tooltip, disabled }: INavbarElement) => (
    <Link href={url}>
        <div
            style={{ pointerEvents: disabled ? 'none' : 'auto', opacity: disabled ? '50%' : '' }}
            className={`
                    cursor-pointer
                    group
                    w-auto md:w-full
                    relative
                    flex items-center
                    transition-all
                    font-semibold text-blue-regular
                    `}
        >
            {title}
            <span
                style={{ left: 'calc(100% + 16px)' }}
                className='
                    absolute p-2 m-2 w-max
                    text-xs font-bold text-red 
                    transition-all duration-300
                    bg-gray-800 text-white
                    rounded-md shadow-md 
                    scale-0 group-hover:scale-100'
            >
                {tooltip}
            </span>
        </div>
    </Link>
)

export default Navbar
