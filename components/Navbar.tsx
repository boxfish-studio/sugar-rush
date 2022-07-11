import { useWallet } from '@solana/wallet-adapter-react'
import Link from 'next/link'
import { FC, useState, useEffect } from 'react'
import Image from 'next/image'
import logo from '../doc/img/logo.png'
import burger from '../doc/img/burger-menu.svg'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button, NavList } from '@primer/react'

interface INavbarElement {
    title: string
    url: string
    tooltip?: string
    disabled?: boolean
}

const Navbar: FC = () => {
    const { publicKey } = useWallet()
    const [open, setOpen] = useState(false)

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
    const [width, setWidth] = useState<number>(0)

    function handleWindowSizeChange() {
        setWidth(window.innerWidth)
    }
    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange)
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange)
        }
    }, [])

    const isMobile = width <= 768
    return (
        <nav
            className='color-bg-emphasis color-fg-subtle position-fixed top-0 left-0 z-10 width-full d-flex flex-row'
            style={{ height: '70px' }}
        >
            <div className='d-flex width-full container-xl p-responsive py-4 flex-justify-between flex-items-center'>
                <div className='d-flex flex-items-center flex-justify-between flex-md-justify-start width-full'>
                    <Image src={logo} alt='logo' width={29} height={21} />
                    {!isMobile ? (
                        <>
                            {' '}
                            <h4 className='ml-2 d-none d-md-flex' style={{ color: 'white' }}>
                                Sugar rush
                            </h4>
                            <div className='d-flex flex-row  '>
                                {NAVBAR_ELEMENTS.map((element) => {
                                    return <NavbarElement disabled={!publicKey} key={element.url} {...element} />
                                })}
                            </div>
                        </>
                    ) : (
                        <>
                            <Button
                                aria-haspopup='true'
                                aria-expanded={open}
                                onClick={() => setOpen(!open)}
                                style={{ background: 'transparent', border: 0 }}
                            >
                                {open ? (
                                    <Image src={burger} alt='logo' width={21} height={21} />
                                ) : (
                                    <Image src={burger} alt='logo' width={21} height={21} />
                                )}
                            </Button>
                            {open && (
                                <NavList
                                    className='d-flex position-absolute top-8 color-bg-emphasis color-fg-subtle width-full left-0'
                                    style={{ height: '100vh' }}
                                >
                                    {NAVBAR_ELEMENTS.map((element) => {
                                        return (
                                            <NavList.Item key={element.url} href={element.url}>
                                                {element.title}
                                            </NavList.Item>
                                        )
                                    })}
                                </NavList>
                            )}
                        </>
                    )}
                </div>

                <WalletMultiButton />
            </div>
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
                style={{ left: 'calc(100% + 16px)', color: '#fff' }}
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
