import { FC } from "react";

import Link from "next/link";

const Navbar: FC = () => {
  return (
    <div className="fixed top-0 left-0 z-10 flex flex-col w-28 h-screen m-0 text-white shadow-lg bg-slate-400">
      <SideBarElement tooltip="Home" href="/" text="Home" />
      <SideBarElement tooltip="List of Candy Machines" href="/list-candy-machines" text="List CMs" />
      <SideBarElement tooltip="Create Candy Machine" href="/create-candy-machine" text="Create CM" />
    </div>
  );
};

const SideBarElement = ({
  text,
  tooltip,
  href,
}: {
  text: string;
  tooltip: string;
  href: string;
}) => (
  <Link href={href} >
    <div
      className="relative flex items-center justify-center w-24 h-12 mx-auto mt-4 text-black 
      transition-all duration-300 ease-linear sidebar-icon-bg shadow-lg cursor-pointer hover:bg-indigo-500
       hover:text-white rounded-xl hover:rounded-xl hover:scale-105 group"
    >
      {text}
      <span
        className="absolute w-auto p-2 m-2 text-xs font-bold text-red transition-all duration-100
     origin-left scale-0 bg-gray-800 rounded-md shadow-md min-w-max left-24 group-hover:scale-100"
      >
        {tooltip}
      </span>
    </div>
  </Link>
);

export default Navbar;
