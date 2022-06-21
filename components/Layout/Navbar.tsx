import { FC } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import Link from 'next/link'

const Navbar: FC = () => {
  const { publicKey } = useWallet()

  return (
    <div className={`${!publicKey ? "pointer-events-none opacity-50" : ""} fixed top-0 left-0 z-10 flex flex-row md:flex-col items-end w-screen md:w-32 transition-all ease-linear h-24 md:h-screen m-0 text-white shadow-lg bg-slate-300`}>
      <SideBarElement
        tooltip='Manage Candy Machines'
        href='/'
        text='Manage CMs'
      />
      <SideBarElement
        tooltip='Create Candy Machine'
        href='/create-candy-machine'
        text='Create CM'
      />
    </div>
  )
}

const SideBarElement = ({
  text,
  tooltip,
  href,
}: {
  text: string
  tooltip: string
  href: string
}) => (
  <Link href={href}>
    <div
      className='relative flex items-center justify-center w-24 h-8 mx-auto mt-4 text-white
      transition-all duration-300 ease-linear bg-[hsl(258,52%,56%)] shadow-lg cursor-pointer hover:bg-[hsl(258,52%,65%)]
       rounded-xl group mb-4 md:mb-0'
    >
      {text}
      <span
        className='absolute w-auto p-2 m-2 text-xs font-bold text-red transition-all duration-300
     origin-left scale-0 bg-gray-800 rounded-md shadow-md min-w-max top-12 md:top-0 md:left-24 group-hover:scale-100'
      >
        {tooltip}
      </span>
    </div>
  </Link>
)

export default Navbar
