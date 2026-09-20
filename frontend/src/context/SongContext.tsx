import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import type { Song, Album, SongContextProps } from '../types'
import { SongContext } from './songContext'

const server = import.meta.env.VITE_SONG_SERVER_URL || 'http://localhost:8000'

export const SongProvider = ({ children }: SongContextProps) => {
  const [songs, setSongs] = useState<Song[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSong, setSelectedSong] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [song, setSong] = useState<Song | null>(null)
  const [albumSong, setAlbumSong] = useState<Song[]>([])
  const [albumData, setAlbumData] = useState<Album | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const [songsRes, albumsRes] = await Promise.allSettled([
        axios.get<{ songs: Song[] }>(`${server}/api/v1/songs`),
        axios.get<{ albums: Album[] }>(`${server}/api/v1/albums`),
      ])

      if (songsRes.status === 'fulfilled') {
        const loadedSongs = songsRes.value.data.songs
        setSongs(loadedSongs)
        if (loadedSongs.length > 0) {
          setSelectedSong(loadedSongs[0].id)
          setSong(loadedSongs[0])
        }
      } else {
        const message = songsRes.reason?.message ?? 'Failed to load songs'
        setError(message)
        toast.error(message)
      }

      if (albumsRes.status === 'fulfilled') {
        setAlbums(albumsRes.value.data.albums)
      } else {
        const message = albumsRes.reason?.message ?? 'Failed to load albums'
        setError((prev) => prev ?? message)
        toast.error(message)
      }

      setLoading(false)
    }
    loadData()
  }, [])

  const fetchSingleSong = useCallback(async (id: number): Promise<Song | null> => {
    const selected = songs.find((item) => item.id === id) ?? null
    setSong(selected)
    setSelectedSong(selected?.id ?? null)
    return selected
  }, [songs])
   
  const [index, setIndex] = useState<number>(0)

  const fetchAlbumsongs = useCallback(async (albumId: string) => {
    const { data } = await axios.get<{ songs: Song[] }>(`${server}/api/v1/albums/${albumId}/songs`)
    setAlbumSong(data.songs)
    setAlbumData(albums.find((album) => album.id === Number(albumId)) ?? null)
  }, [albums])

  const fetchSongs = useCallback(async () => {
    const { data } = await axios.get<{ songs: Song[] }>(`${server}/api/v1/songs`)
    setSongs(data.songs)
  }, [])

  const fetchAlbums = useCallback(async () => {
    const { data } = await axios.get<{ albums: Album[] }>(`${server}/api/v1/albums`)
    setAlbums(data.albums)
  }, [])

  // nextSong: advance one song; if we're on the last song, loop back to the first
  const nextSong = useCallback(() => {
    if (songs.length === 0) return
    if (index === songs.length - 1) {
      setIndex(0)
      setSelectedSong(songs[0]?.id ?? null)
    } else {
      const next = index + 1
      setIndex(next)
      setSelectedSong(songs[next]?.id ?? null)
    }
  }, [index, songs])

  // prevSong: step back one song; if we're on the first song, loop around to the last
  const prevSong = useCallback(() => {
    if (songs.length === 0) return
    if (index === 0) {
      const last = songs.length - 1
      setIndex(last)
      setSelectedSong(songs[last]?.id ?? null)
    } else {
      const prev = index - 1
      setIndex(prev)
      setSelectedSong(songs[prev]?.id ?? null)
    }
  }, [index, songs])

  return (
    <SongContext.Provider value={{ songs, loading, error, selectedSong, setSelectedSong, isPlaying, setIsPlaying, albums, song, albumSong, albumData, fetchSingleSong, fetchAlbumsongs, fetchSongs, fetchAlbums, nextSong, prevSong }}>
      {children}
    </SongContext.Provider>
  )
}