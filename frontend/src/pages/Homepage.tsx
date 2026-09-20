import AlbumCard from '../components/AlbumCard'
import SongCard from '../components/SongCard'
import Layout from '../components/Layout'
import Loading from '../components/Loading'
import { ThemeToggle } from '../components/theme'
import { useSongContext } from '../context/songContext'

const Homepage = () => {
  const { albums, songs, loading } = useSongContext()

  if (loading) return <Loading />

  return (
    <div>
      <Layout>
        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>
        <div className='mb-4'>
          <h1 className='text-2xl font-bold my-5'>Trending</h1>
          <div className='flex overflow-auto'>
            {albums.map((e, i) => (
              <AlbumCard key={i} image={e.thumbnail} name={e.title} desc={e.description ?? ''} id={e.id} />
            ))}
          </div>
        </div>


      <div className='mb-4'>
          <h1 className='text-2xl font-bold my-5'>Today's Top Hits</h1>
          <div className='flex overflow-auto'>
            {songs.map((e, i) => (
              <SongCard key={i} image={e.thumbnail} name={e.title} description={e.description ?? ''} id={e.id} />
            ))}
          </div>
        </div>


      </Layout>
    </div>
  )
}

export default Homepage