import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useSongContext } from '../context/songContext'
import { GrChapterNext, GrChapterPrevious } from 'react-icons/gr'
import { FaPause, FaPlay } from 'react-icons/fa6'
import { FiVolume2, FiVolumeX, FiMusic } from 'react-icons/fi'
import { motion, useReducedMotion } from 'framer-motion'

const Player = () => {
  const { song, fetchSingleSong, selectedSong, isPlaying, setIsPlaying, nextSong, prevSong } = useSongContext()
  const navigate = useNavigate()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const reduced = useReducedMotion()

  const [volume, setVolume] = useState<number>(1)
  const [muted, setMuted] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
   const [duration, setduration] = useState<number>(0)

  const hasSong = Boolean(song)

  const spinAnimate = reduced || !isPlaying ? { rotate: 0 } : { rotate: 360 }
  const spinTransition = reduced || !isPlaying
    ? { duration: 0.45, ease: 'easeOut' as const }
    : { rotate: { duration: 3, ease: 'linear' as const, repeat: Infinity } }

  useEffect(() => {

    const audio = audioRef.current
    if (!audio) {
      return
    }

    const handleLoadedMetaData = () => { 
      setduration(audio.duration || 0)
      setProgress(0)
      if (isPlaying) audio.play().catch(() => {})
    }

    const  handleTimeUpdate = () => {
      setProgress(audio.currentTime || 0)
    }

    const handleEnded = () => {
      nextSong()
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetaData)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetaData)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [song, isPlaying, nextSong])

  const handlePlayorPause = () => {
    if (!hasSong) return
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {
        toast.error('Unable to play this song')
      })
    }
    setIsPlaying(!isPlaying)
  }

  // keep the audio element in sync with the global isPlaying state so that
  // play/pause actions from outside the player (album rows, song cards) work too
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isPlaying, song])
  
  const volumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = (parseFloat(e.target.value) / 100)
    if(audioRef.current) {
      audioRef.current.volume = newVolume
      setVolume(newVolume)
    }
  }

  const toggleMute = () => {
    if (!hasSong) return
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(!muted)
  }

  const durationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = (parseFloat(e.target.value) / 100) * duration
    if(audioRef.current) {
      audioRef.current.currentTime = newDuration
      setProgress(newDuration)
    }
  }

useEffect(() => {
  
    if (selectedSong) fetchSingleSong(selectedSong);
 
}, [selectedSong, fetchSingleSong]);

  return (
    <div className="h-[10%] shrink-0 flex items-center justify-between px-4 bg-[var(--mc-frame-bg)] text-[var(--mc-frame-text)] border-t border-[#2E2A55]">

          <div className="shrink-0 items-center gap-4 lg:flex min-w-0">
            {song ? (
              <div className="relative shrink-0" onClick={() => { navigate(`/song/${song.id}`) }}>
                <motion.div
                  className="absolute -inset-1.5 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, rgba(142,130,255,0.5), rgba(23,20,43,0) 22%, rgba(142,130,255,0.25) 45%, rgba(23,20,43,0) 72%, rgba(142,130,255,0.5))",
                  }}
                  animate={spinAnimate}
                  transition={spinTransition}
                />
                <motion.img
                  src={song.thumbnail ? song.thumbnail : "/download.jpeg"}
                  alt={song.title}
                  className="relative w-[50px] h-[50px] rounded-full"
                  animate={spinAnimate}
                  transition={spinTransition}
                />
              </div>
            ) : (
              <div className="relative shrink-0 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#241F45] text-[var(--mc-frame-muted)]">
                <FiMusic size={22} />
              </div>
            )}

            <div className='hidden md:block min-w-0'> 
              <p className='font-bold truncate text-[var(--mc-frame-text)]'>{song ? song.title : "Nothing playing"}</p>
              <p className='text-sm text-[var(--mc-frame-muted)] truncate'>{song ? `${song.description?.slice(0, 30)}...` : "Pick a track to start listening"}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 m-auto">

            {
              song && song.audio && (
                <audio key={song.id} ref={audioRef} className="hidden">
                  <source src={song.audio} type="audio/mpeg" />
                </audio>
              )
            }

            <input type="range" min={"0"} max={"100"} className="progress-bar mc-glow w-[120px] md:w-[300px]" value={song ? (progress / duration) * 100 || 0 : 0} onChange={(e) => durationChange(e)} />

            <div className="flex items-center justify-center gap-4">
              <button type="button" title="Previous" aria-label="Previous"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--mc-frame-text)] transition hover:bg-white/10 hover:text-[#8E82FF]"
                onClick={() => { if (hasSong) prevSong() }}>
                <GrChapterPrevious />
              </button>

              <button type="button" aria-label={isPlaying ? "Pause" : "Play"} title={isPlaying ? "Pause" : "Play"}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#8E82FF] to-[#6C5CFF] text-white shadow-[0_0_24px_rgba(108,92,255,0.65)] transition hover:shadow-[0_0_36px_rgba(108,92,255,0.95)]"
                onClick={handlePlayorPause}>
                <span className="pl-0.5">
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </span>
              </button>

              <button type="button" title="Next" aria-label="Next"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--mc-frame-text)] transition hover:bg-white/10 hover:text-[#8E82FF]"
                onClick={() => { if (hasSong) nextSong() }}>
                <GrChapterNext />
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full mr-2 text-[var(--mc-frame-muted)] transition hover:text-[#8E82FF]"
            >
              {muted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
            </button>
            <input
              type="range"
              className="mc-glow w-16 md:w-32"
              min="0"
              max="100"
              step="0.01"
              value={volume * 100}
              onChange={(e) =>{ setMuted(false); volumeChange(e) }}
            />
          </div>

  </div>
  )
}

export default Player