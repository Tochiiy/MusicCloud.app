
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Player from './Player'

interface LayoutProps {
  children: ReactNode;
}
const Layout = ({children}: LayoutProps) => {
  return (
      <div className='h-screen'>
          <div className="h-[90%] flex">
              <Sidebar />

              <div className="w-[100%] m-2 px-6 pt-4 rounded bg-[#17142B] text-white overflow-auto lg:w-[75%] lg:ml-0">
              <Navbar />
              {children}
              </div>
          </div>
          <Player />
      </div>
  )
}

export default Layout