import type { ReactNode } from 'react'

export interface Song {
  id: number
  title: string
  description: string | null
  thumbnail: string
  audio: string
  album_id: number | null
  created_at: string
  thumbnail_public_id: string | null
  audio_public_id: string | null
}

export interface Album {
  id: number
  title: string
  description: string | null
  thumbnail: string
  created_at: string
  thumbnail_public_id: string | null
}

export interface SongContextType {
  songs: Song[]
  loading: boolean
  error: string | null
  selectedSong: number | null
  setSelectedSong: (songId: number | null) => void
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  albums: Album[]
  song: Song | null
  albumSong: Song[]
  albumData: Album | null
  fetchSingleSong: (id: number) => Promise<Song | null>
  fetchAlbumsongs: (albumId: string) => Promise<void>
  fetchSongs: () => Promise<void>
  fetchAlbums: () => Promise<void>
  nextSong: () => void
  prevSong: () => void
}

export interface SongContextProps {
  children: ReactNode
}

export interface User {
  _id: string
  name: string
  email: string
  role: string
  playlist: string[]
}