import { FaBookmark, FaPlay } from "react-icons/fa6"
import type { FC } from 'react'
import type { SongCardProps } from "../types/SongCardProps"
import { useNavigate } from "react-router-dom"

const SongCard: FC<SongCardProps> = ({ image, name, description, id }) => {
  const navigate = useNavigate()

  return (
    <div
      className="group min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#17142B]"
      onClick={() => { navigate(`/song/${id}`) }}
    >
      <div className="relative">
        <img src={image ? image : "./download.jpeg"} alt={name} className="rounded w-[180px] mr-1" />
        <div className="flex gap-2">
          <button className="absolute bottom-2 right-14 bg-[#6C5CFF] text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"><FaPlay /></button>
          <button className="absolute bottom-2 right-2 bg-[#6C5CFF] text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"><FaBookmark /></button>
        </div>
      </div>

      <p className="font-bold mt-2 mb-1">#{id} {name.slice(0, 12)}...</p>
      <p className="text-sm text-slate-200">{description.slice(0, 20)}...</p>
    </div>
  )
}

export default SongCard