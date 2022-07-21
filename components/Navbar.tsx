import { FC, useState } from 'react'
import Image from 'next/image'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { NavList, Breadcrumbs } from '@primer/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { INavbarElement } from 'lib/interfaces'
import { NetworkSelector, NetworkTps } from 'components'

const Navbar: FC = () => {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const NAVBAR_ELEMENTS: INavbarElement[] = [
        {
            title: 'Dashboard / Candy Machines',
            url: '/',
        },
    ]

    return (
        <nav
            className='color-bg-emphasis color-fg-subtle position-fixed top-0 left-0 z-3 width-full d-flex flex-row color-fg-on-emphasis'
            style={{ height: '70px' }}
        >
            <div className='d-flex width-full container-xl p-responsive py-4 flex-justify-between flex-items-center'>
                <div className='d-flex flex-items-center flex-justify-start width-full'>
                    <div className='d-flex flex-shrink-0'>
                        <Image src='/logo.png' alt='logo' width={29} height={21} />
                        <h4 className='ml-2'>Sugar rush</h4>
                    </div>
                    <Breadcrumbs className='d-none d-md-flex flex-row ml-3'>
                        {NAVBAR_ELEMENTS.map((element) => {
                            return (
                                <Link href={element.url} key={element.url}>
                                    <Breadcrumbs.Item
                                        href={element.url}
                                        key={element.url}
                                        className={`${
                                            router.asPath === element.url ? 'text-bold' : ''
                                        } color-fg-on-emphasis`}
                                    >
                                        {element.title}
                                    </Breadcrumbs.Item>
                                </Link>
                            )
                        })}
                    </Breadcrumbs>
                    <div className='d-md-none'>
                        <div
                            onClick={() => setOpen(!open)}
                            className='ml-2 d-flex flex-justify-center flex-items-center'
                            style={{ cursor: 'pointer' }}
                        >
                            <Image
                                src='/down-arrow.svg'
                                alt='logo'
                                width={21}
                                height={21}
                                style={{
                                    transform: `${open ? 'rotate(90deg)' : 'rotate(0deg)'}`,
                                    transition: 'transform 0.2s linear',
                                }}
                            />
                        </div>
                    </div>
                    {open && (
                        <NavList
                            className='d-flex position-absolute top-8 color-bg-emphasis color-fg-subtle width-full left-0'
                            sx={{ height: '100vh' }}
                        >
                            {NAVBAR_ELEMENTS.map((element) => {
                                return (
                                    <Link href={element.url} key={element.url}>
                                        <NavList.Item
                                            key={element.url}
                                            href={element.url}
                                            onClick={() => setOpen(!open)}
                                            className={`${
                                                router.asPath === element.url ? 'text-bold' : ''
                                            } color-fg-on-emphasis`}
                                        >
                                            {element.title}
                                        </NavList.Item>
                                    </Link>
                                )
                            })}
                        </NavList>
                    )}
                </div>
                <NetworkTps />
                <NetworkSelector />
                <WalletMultiButton />
            </div>
        </nav>
    )
}

export default Navbar
