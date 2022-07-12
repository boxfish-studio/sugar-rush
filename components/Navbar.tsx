import { FC, useState, useEffect } from 'react'
import Image from 'next/image'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button, NavList, Tooltip, Breadcrumbs } from '@primer/react'
import { useRouter } from 'next/router'

interface INavbarElement {
    title: string
    url: string
    tooltip?: string
    disabled?: boolean
}

const Navbar: FC = () => {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const NAVBAR_ELEMENTS: INavbarElement[] = [
        {
            title: 'Dashboard',
            url: '/',
            tooltip: 'Dashboard',
        },
        {
            title: 'Candy Machines',
            url: '/create-candy-machine',
            tooltip: 'Candy Machines',
        },
    ]
    const handleResize = () => {
        if (window.innerWidth < 768) {
            setIsMobile(true)
        } else {
            setIsMobile(false)
        }
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize)
    })

    return (
        <nav
            className='color-bg-emphasis color-fg-subtle position-fixed top-0 left-0 z-10 width-full d-flex flex-row'
            style={{ height: '70px' }}
        >
            <div className='d-flex width-full container-xl p-responsive py-4 flex-justify-between flex-items-center'>
                <div
                    className={`d-flex flex-items-center ${
                        isMobile ? 'flex-justify-between' : 'flex-justify-start'
                    } width-full`}
                >
                    <div className='d-flex'>
                        <Image src='/logo.png' alt='logo' width={29} height={21} />
                        <h4 className='ml-2' style={{ color: 'white' }}>
                            Sugar rush
                        </h4>
                    </div>
                    {!isMobile ? (
                        <>
                            {' '}
                            <Breadcrumbs className='d-flex flex-row ml-3' sx={{ color: 'white' }}>
                                {NAVBAR_ELEMENTS.map((element) => {
                                    return (
                                        <Breadcrumbs.Item
                                            href={element.url}
                                            key={element.url}
                                            sx={{ color: 'white' }}
                                            className={router.asPath === element.url ? 'text-bold' : ''}
                                        >
                                            <Tooltip
                                                aria-label={element.tooltip}
                                                style={{ color: '#fff', cursor: 'pointer' }}
                                                direction='s'
                                            >
                                                {element.title}
                                            </Tooltip>
                                        </Breadcrumbs.Item>
                                    )
                                })}
                            </Breadcrumbs>
                        </>
                    ) : (
                        <>
                            <Button
                                aria-haspopup='true'
                                aria-expanded={open}
                                onClick={() => setOpen(!open)}
                                sx={{ background: 'transparent', border: 0 }}
                            >
                                {open ? (
                                    <Image src='/burger.svg' alt='logo' width={21} height={21} />
                                ) : (
                                    <Image src='/burger.svg' alt='logo' width={21} height={21} />
                                )}
                            </Button>
                            {open && (
                                <NavList
                                    className='d-flex position-absolute top-8 color-bg-emphasis color-fg-subtle width-full left-0'
                                    sx={{ height: '100vh' }}
                                >
                                    {NAVBAR_ELEMENTS.map((element) => {
                                        return (
                                            <NavList.Item key={element.url} href={element.url} sx={{ color: 'white' }}>
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

export default Navbar
