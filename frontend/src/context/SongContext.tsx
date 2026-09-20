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
    const selected =
      songs.find((item) => item.id === id) ??
      (song?.id === id ? song : null)
    setSong(selected)
    setSelectedSong(selected?.id ?? null)
    return selected
  }, [song, songs])

  // Deep-link/fallback lookup: fetch a single song from the server when it is
  // not present in the already-loaded list (e.g. direct navigation to /song/:id).
  // Also updates the global player state so the bottom bar follows the page.
  const fetchSongById = useCallback(async (id: number): Promise<Song | null> => {
    const localSong = songs.find((item) => item.id === id)
    if (localSong) {
      setSong(localSong)
      setSelectedSong(localSong.id)
      return localSong
    }
    try {
      const { data } = await axios.get<{ song: Song }>(`${server}/api/v1/songs/${id}`)
      setSong(data.song)
      setSelectedSong(data.song.id)
      return data.song
    } catch {
      return null
    }
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

  // REFERENCE - previous implementation, removed when switching to
  // "advance relative to the currently playing song" (kept for reference):
  //
  // nextSong: advance one song; if we're on the last song, loop back to the first
  // const nextSong = useCallback(() => {
  //   if (songs.length === 0) return
  //   if (index === songs.length - 1) {
  //     setIndex(0)
  //     setSelectedSong(songs[0]?.id ?? null)
  //   } else {
  //     const next = index + 1
  //     setIndex(next)
  //     setSelectedSong(songs[next]?.id ?? null)
  //   }
  // }, [index, songs])
  //
  // prevSong: step back one song; if we're on the first song, loop around to the last
  // const prevSong = useCallback(() => {
  //   if (songs.length === 0) return
  //   if (index === 0) {
  //     const last = songs.length - 1
  //     setIndex(last)
  //     setSelectedSong(songs[last]?.id ?? null)
  //   } else {
  //     const prev = index - 1
  //     setIndex(prev)
  //     setSelectedSong(songs[prev]?.id ?? null)
  //   }
  // }, [index, songs])

  // nextSong: advance to the song after the currently playing one;
  // if we're on the last song, loop back to the first
  const nextSong = useCallback(() => {
    if (songs.length === 0) return
    const current = song ? songs.findIndex((s) => s.id === song.id) : index
    const target = current === -1 || current >= songs.length - 1 ? 0 : current + 1
    setIndex(target)
    setSelectedSong(songs[target]?.id ?? null)
  }, [index, song, songs])

  // prevSong: step back to the song before the currently playing one;
  // if we're on the first song, loop around to the last
  const prevSong = useCallback(() => {
    if (songs.length === 0) return
    const current = song ? songs.findIndex((s) => s.id === song.id) : index
    const target = current <= 0 || current === -1 ? songs.length - 1 : current - 1
    setIndex(target)
    setSelectedSong(songs[target]?.id ?? null)
  }, [index, song, songs])

  return (
    <SongContext.Provider value={{ songs, loading, error, selectedSong, setSelectedSong, isPlaying, setIsPlaying, albums, song, albumSong, albumData, fetchSingleSong, fetchSongById, fetchAlbumsongs, fetchSongs, fetchAlbums, nextSong, prevSong }}>
      {children}
    </SongContext.Provider>
  )
}