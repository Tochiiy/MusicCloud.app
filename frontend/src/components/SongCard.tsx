import { FaBookmark, FaDownload, FaPlay } from "react-icons/fa6"
import type { FC } from 'react'
import type { SongCardProps } from "../types/SongCardProps"
import { useNavigate } from "react-router-dom"
import { useUserData } from "../context/userContext"
import { useSongContext } from "../context/songContext"
import toast from "react-hot-toast"

const server = import.meta.env.VITE_SONG_SERVER_URL || 'http://localhost:8000'

const SongCard: FC<SongCardProps> = ({ image, name, description, id }) => {
  const navigate = useNavigate()

  const { addToPlaylist, isAuth } = useUserData()
  const { setSelectedSong, setIsPlaying } = useSongContext()

  const handleDownload = async () => {
    try {
      const response = await fetch(`${server}/api/v1/songs/${id}/download`);
      if (!response.ok) {
        toast.error("Failed to download song");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name || "song"}.mp3`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download song");
    }
  }

  const saveToPlaylist = async () => {
    await addToPlaylist(String(id));
  }

  const handlePlay = () => {
    setSelectedSong(id);
    setIsPlaying(true);
  }

  return (
    <div
      className="group min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#17142B]"
      onClick={() => { navigate(`/song/${id}`) }}
    >
      <div className="relative">
        <img src={image ? image : "./download.jpeg"} alt={name} className="rounded w-[180px] mr-1" />
        <div className="flex gap-2">
          <button
            className="absolute bottom-2 right-26 bg-[#6C5CFF] text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => { e.stopPropagation(); handlePlay(); }}
          >
            <FaPlay />
          </button>

          {isAuth && (
            <button
              className="absolute bottom-2 right-14 bg-[#6C5CFF] text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => { e.stopPropagation(); saveToPlaylist(); }}
            >
              <FaBookmark />
            </button>
          )}

          <button
            className="absolute bottom-2 right-2 bg-[#6C5CFF] text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          >
            <FaDownload />
          </button>
        </div>
      </div>

      <p className="font-bold mt-2 mb-1">#{id} {name.slice(0, 12)}...</p>
      <p className="text-sm text-slate-200">{description.slice(0, 20)}...</p>
    </div>
  )
}

export default SongCard