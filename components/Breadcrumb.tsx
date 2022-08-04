import { FC, useEffect, useState } from 'react'
import { Breadcrumbs, NavList } from '@primer/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { INavbarElement } from 'lib/interfaces'
import Image from 'next/image'

const Breadcrumb: FC = () => {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [breadcrumbs, setBreadcrumbs] = useState<INavbarElement[]>([])

    useEffect(() => {
        if (router) {
            const isCM = (path: string): boolean => {
                return router.query.candy_machine_ID === path
            }
            const linkPath = router.asPath.split('/')
            linkPath.shift()
            const pathArray = linkPath?.map((path, i) => ({
                title: isCM(path) ? '[CM]: ' + path.substring(0, 12).concat('...') : path,
                url: '/' + linkPath.slice(0, i + 1).join('/'),
            }))
            pathArray[0].title === ''
                ? (pathArray[0].title = 'Dashboard')
                : pathArray.unshift({ title: 'Dashboard', url: '/' })
            setBreadcrumbs(pathArray)
        }
    }, [router])

    return (
        <>
            <Breadcrumbs className='d-none d-md-flex flex-row ml-3'>
                {breadcrumbs.map((element) => {
                    return (
                        <Link href={element.url} key={element.title}>
                            <Breadcrumbs.Item
                                className={`${router.asPath === element.url ? 'text-bold' : ''} color-fg-on-emphasis`}
                                style={{ cursor: 'pointer' }}
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
            <NavList
                className='d-flex position-absolute top-8 color-bg-emphasis color-fg-subtle width-full left-0'
                style={{
                    transition: 'transform 0.2s ease-in-out',
                    transform: `${!open ? 'scaleY(0)' : 'scaleY(1)'}`,
                    transformOrigin: 'top',
                }}
                sx={{ height: '100vh' }}
            >
                {breadcrumbs.map((element) => {
                    return (
                        <Link href={element.url} key={element.title}>
                            <NavList.Item
                                onClick={() => setOpen(!open)}
                                className={`${router.asPath === element.url ? 'text-bold' : ''} color-fg-on-emphasis`}
                            >
                                {element.title}
                            </NavList.Item>
                        </Link>
                    )
                })}
            </NavList>
        </>
    )
}

export default Breadcrumb
