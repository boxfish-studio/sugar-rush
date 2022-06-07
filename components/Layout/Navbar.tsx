import { FC } from 'react'

import Link from 'next/link'

const Navbar: FC = () => {
  return (
    <div className='fixed top-0 left-0 z-10 flex flex-row md:flex-col items-end w-screen md:w-32 h-28 md:h-screen m-0 text-white shadow-lg bg-slate-300'>
      <SideBarElement tooltip='Home' href='/' text='Home' className="mb-4 md:mb-0" />
      <SideBarElement
        tooltip='List of Candy Machines'
        href='/list-candy-machines'
        text='List CMs'
        className="mb-4 md:mb-0"
      />
      <SideBarElement
        tooltip='Create Candy Machine'
        href='/create-candy-machine'
        text='Create CM'
        className="mb-4 md:mb-0"
      />
    </div>
  )
}

const SideBarElement = ({
  text,
  tooltip,
  href,
  className
}: {
  text: string
  tooltip: string
  href: string
  className?: string
}) => (
  <Link href={href}>
    <div
      className={`relative flex items-center justify-center w-24 h-12 mx-auto mt-4 text-white 
      transition-all duration-300 ease-linear bg-[hsl(258,52%,56%)] shadow-lg cursor-pointer hover:bg-indigo-500
       rounded-xl hover:rounded-xl hover:scale-105 group ${className}`}
    >
      {text}
      <span
        className='absolute w-auto p-2 m-2 text-xs font-bold text-red transition-all duration-100
     origin-left scale-0 bg-gray-800 rounded-md shadow-md min-w-max top-12 md:top-0 md:left-24 group-hover:scale-100'
      >
        {tooltip}
      </span>
    </div>
  </Link>
)

export default Navbar
