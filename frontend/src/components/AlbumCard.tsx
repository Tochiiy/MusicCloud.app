import type { FC } from 'react'
import type { AlbumCardProps } from '../types/AlbumCardProps'
import { useNavigate } from 'react-router-dom'

const AlbumCard: FC<AlbumCardProps> = ({ image, name, desc, id }) => {
  const navigate = useNavigate()

  return (
    <div
      className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[var(--mc-hover)]"
      onClick={() => { navigate(`/album/${id}`) }}
    >
      <img src={image} alt="" className="rounded w-[180px]" />
      <p className="font-bold mt-2 mb-1 text-[var(--mc-text)]">{name.slice(0, 12)}...</p>
      <p className="text-sm text-[var(--mc-text-muted)]">{desc.slice(0, 18)}...</p>
    </div>
  )
}

export default AlbumCard