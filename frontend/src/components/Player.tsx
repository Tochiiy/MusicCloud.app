import { useEffect, useRef, useState } from 'react'
import { useSongContext } from '../context/songContext'
import { GrChapterNext, GrChapterPrevious } from 'react-icons/gr'
import { FaPause, FaPlay } from 'react-icons/fa6'

const Player = () => {
  const { song, fetchSingleSong, selectedSong, isPlaying, setIsPlaying, nextSong, prevSong } = useSongContext()

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [volume, setVolume] = useState<number>(1)
  const [progress, setProgress] = useState<number>(0)
   const [duration, setduration] = useState<number>(0)

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
      audio.play().catch(() => {})
    }
    setIsPlaying(!isPlaying)
  }
  
  const volumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = (parseFloat(e.target.value) / 100)
    if(audioRef.current) {
      audioRef.current.volume = newVolume
      setVolume(newVolume)
    }
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

            <img src={song.thumbnail ? song.thumbnail : "./download.jpeg"} alt={song.title} className="w-[50px] h-[50px] rounded-full" onClick={() => { fetchSingleSong(song.id) }} />
            
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
            <input
              type="range"
              className="w-16 md:w-32"
              min="0"
              max="100"
              step="0.01"
              value={volume * 100}
              onChange={(e) => volumeChange(e)}
            />
          </div>
          </div>
      )
      }

  </div>
}

export default Player