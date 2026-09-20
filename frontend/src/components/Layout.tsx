
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Player from './Player'
import MobileNav from './MobileNav'

interface LayoutProps {
  children: ReactNode;
}
const Layout = ({children}: LayoutProps) => {
  return (
      <div className='h-screen flex flex-col'>
          <div className="flex flex-1 min-h-0">
              <Sidebar />

              <div className="w-[100%] m-2 px-6 pt-4 rounded bg-[var(--mc-bg)] text-[var(--mc-text)] overflow-auto lg:w-[75%] lg:ml-0">
              <Navbar />
              {children}
              </div>
          </div>
          <Player />
          <MobileNav />
      </div>
  )
}

export default Layout