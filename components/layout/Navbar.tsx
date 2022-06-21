import { useWallet } from '@solana/wallet-adapter-react'
import Link from 'next/link'
import React, { FC } from 'react'

interface INavbarElement {
    title: string
    url: string
    tooltip?: string
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
            className={`${!publicKey ? 'pointer-events-none opacity-50' : ''
                } fixed top-0 left-0 w-32 h-screen px-2 py-10 z-10 flex flex-col space-y-4 bg-gray-300`}
        >
            {NAVBAR_ELEMENTS.map((element) => {
                return <NavbarElement key={element.url} {...element} />
            })}
        </div>
    )
}

const NavbarElement = (props: INavbarElement) => (
    <Link href={props.url}>
        <div className='relative px-2 py-3 text-center flex items-center justify-center text-white transition-all duration-300 ease-linear cursor-pointer bg-blue-regular hover:bg-blue-dark rounded-xl hover:rounded-xl group'>
            {props.title}
            <span
                style={{ left: 'calc(100% + 8px)' }}
                className='absolute p-2 text-xs font-bold transition-all duration-100 scale-0 bg-gray-800 rounded-md shadow-md min-w-max group-hover:scale-100'
            >
                {props.tooltip}
            </span>
        </div>
    </Link>
)

export default Navbar
