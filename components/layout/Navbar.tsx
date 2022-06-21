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
        <div
            className='
                fixed top-0 left-0 z-10 
                flex flex-row md:flex-col items-center md:justify-between px-2 py-4
                md:h-screen w-screen md:w-48 
                transition-all ease-linear 
                text-white shadow-lg bg-slate-300
            '
        >
            <div className='w-full flex flex-row md:flex-col space-x-4 md:space-x-0 md:space-y-4'>
                {NAVBAR_ELEMENTS.map((element) => {
                    return <NavbarElement disabled={!publicKey} key={element.url} {...element} />
                })}
            </div>
        </div>
    )
}

const NavbarElement = ({ title, url, tooltip, disabled }: INavbarElement) => (
    <Link href={url}>
        <div
            style={{ pointerEvents: disabled ? 'none' : 'auto', opacity: disabled ? '50%' : '' }}
            className='
            group w-auto md:w-full
            relative text-center text-white cursor-pointer px-2 py-3 
            flex items-center justify-center 
            transition-all duration-300 ease-linear
            rounded-xl hover:rounded-xl
            bg-[hsl(258,52%,56%)] hover:bg-[hsl(258,52%,65%)]'
        >
            {title}
            <span
                style={{ left: 'calc(100% + 8px)' }}
                className='
                    absolute w-auto md:w-full 
                    p-2 m-2 
                    text-xs font-bold text-red 
                    transition-all duration-300
                    bg-gray-800 
                    rounded-md shadow-md 
                    scale-0 after:group-hover:scale-100'
            >
                {tooltip}
            </span>
        </div>
    </Link>
)

export default Navbar
