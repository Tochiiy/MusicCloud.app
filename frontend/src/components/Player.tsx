import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useSongContext } from '../context/songContext'
import { GrChapterNext, GrChapterPrevious } from 'react-icons/gr'
import { FaPause, FaPlay } from 'react-icons/fa6'
import { FiVolume2, FiVolumeX } from 'react-icons/fi'
import { motion, useReducedMotion } from 'framer-motion'

const Player = () => {
  const { song, fetchSingleSong, selectedSong, isPlaying, setIsPlaying, nextSong, prevSong } = useSongContext()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const reduced = useReducedMotion()

  const [volume, setVolume] = useState<number>(1)
  const [muted, setMuted] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
   const [duration, setduration] = useState<number>(0)

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

    audio.addEventListener('loadedmetadata', handleLoadedMetaData)
    audio.addEventListener('timeupdate', handleTimeUpdate)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetaData)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [song, isPlaying])

  const handlePlayorPause = () => {
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

  return <div>
    
    {
      song && (
        <div className="h-[10%] bg-[#17142B] flex items-center justify-between text-white px-4">
          <div className="items-center gap-4 lg:flex">

            <div className="relative shrink-0" onClick={() => { fetchSingleSong(song.id) }}>
              <motion.div
                className="absolute -inset-1.5 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(142,130,255,0.4), rgba(23,20,43,0) 22%, rgba(142,130,255,0.2) 45%, rgba(23,20,43,0) 72%, rgba(142,130,255,0.4))",
                }}
                animate={spinAnimate}
                transition={spinTransition}
              />
              <motion.img
                src={song.thumbnail ? song.thumbnail : "./download.jpeg"}
                alt={song.title}
                className="relative w-[50px] h-[50px] rounded-full"
                animate={spinAnimate}
                transition={spinTransition}
              />
            </div>
            
            <div className='hidden md:block'> 
              <p className='font-bold'>{song.title}</p>
              <p className='text-sm text-slate-200'>{song.description?.slice(0, 30)}...</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 m-auto"> 

            {
              song.audio && (
                <audio key={song.id} ref={audioRef} className="hidden">
                  <source src={song.audio} type="audio/mpeg" />
                </audio>
              )
            }

            <input type="range" min={"0"} max={"100"} className="progress-bar w-[120px] md:w-[300px]" value={(progress / duration) * 100 || 0} onChange={(e) => durationChange(e)} />

            <div className="flex items-center justify-center gap-6">
              <span className="cursor-pointer" onClick={prevSong}><GrChapterPrevious /></span>

              <button className='bg-white rounded-full p-2 text-black flex items-center justify-center' onClick={handlePlayorPause}>
                {
                  isPlaying ? (
                    <FaPause />
                  ) : (
                    <FaPlay />
                  )
                }
              </button>

              <span className="cursor-pointer" onClick={nextSong}><GrChapterNext /></span>
            </div>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
              className="cursor-pointer mr-2 text-white/70 hover:text-white"
            >
              {muted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
            </button>
            <input
              type="range"
              className="w-16 md:w-32"
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

  </div>
}

export default Player