import { FC } from 'react'
import { useRouter } from 'next/router'

import Link from 'next/link'

const Navbar: FC = () => {
  const router = useRouter()

  const currentPath = `/${router.asPath.split('/')[1]}`

  return (
    <div className='fixed top-0 left-0 z-10 flex flex-col w-28 h-screen m-0 text-white shadow-lg bg-slate-400'>
      <SideBarElement
        tooltip='Home'
        href='/'
        text='Home'
        asPath={currentPath}
      />
      <SideBarElement
        tooltip='List of Candy Machines'
        href='/list-candy-machines'
        text='List CMs'
        asPath={currentPath}
      />
      <SideBarElement
        tooltip='Create Candy Machine'
        href='/create-candy-machine'
        text='Create CM'
        asPath={currentPath}
      />
    </div>
  )
}

const SideBarElement = ({
  text,
  tooltip,
  href,
  asPath,
}: {
  text: string
  tooltip: string
  href: string
  asPath: string
}) => (
  <Link href={href}>
    <div
      className={`relative flex items-center justify-center w-24 h-12 mx-auto mt-4 text-white 
      transition-all duration-300 ease-linear shadow-lg cursor-pointer hover:bg-indigo-500
       rounded-xl hover:rounded-xl hover:scale-105 group ${
         asPath === href ? 'bg-[hsl(257,72%,18%)]' : 'bg-[hsl(258,52%,56%)] '
       } `}
    >
      {text}
      <span
        className='absolute w-auto p-2 m-2 text-xs font-bold text-red transition-all duration-100
     origin-left scale-0 bg-gray-800 rounded-md shadow-md min-w-max left-24 group-hover:scale-100'
      >
        {tooltip}
      </span>
    </div>
  </Link>
)

export default Navbar
