import { FaMusic } from 'react-icons/fa6'

const PlayListCard = () => {
  return (
      <div className='flex items-center p-4 rounded-lg shadow-md cursor-pointer hover:bg-[#ffffff26]'>
          <div className='w-10 h-10  bg-grey-600 flex items-center justify-center rounded-md'>
              <FaMusic className='text-white text-xl' />
          </div>
          <div className='ml-4'>
              <h2 className='font-bold'>My Playlist</h2>    
              <p className='text-sm text-gray-400'>PlayList • <span>{"User" }</span></p>
          </div>
      </div>
  )
}

export default PlayListCard