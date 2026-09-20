import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useSongContext } from "../context/songContext";
import { useUserData } from "../context/userContext";
import { FaBookmark, FaDownload, FaHeart, FaPause, FaPlay, FaRegHeart } from "react-icons/fa6";
import Loading from "../components/Loading";
import Logo from "../components/Logo";
import SongCard from "../components/SongCard";
import { useTheme } from "../components/themeContext";
import { downloadSong } from "../utils/downloadSong";
import type { Song } from "../types";

const SongPage = () => {
  const params = useParams<{ id: string }>();
  const songId = params.id ? Number(params.id) : Number.NaN;

  const { songs, loading: songsLoading, error: songError, fetchSongById, setIsPlaying, setSelectedSong, selectedSong, isPlaying } = useSongContext();
  const { isAuth, user, addToPlaylist, toggleLike } = useUserData();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchSongById(songId)
      .then((result) => {
        if (active) setSong(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [songId, fetchSongById]);

  const relatedSongs = useMemo(() => {
    if (!song) return [];
    if (song.album_id) {
      const sameAlbum = songs.filter((s) => s.album_id === song.album_id && s.id !== song.id);
      if (sameAlbum.length > 0) return sameAlbum;
    }
    return songs.filter((s) => s.id !== song.id);
  }, [song, songs]);

  const liked = (user?.likedSongs ?? []).includes(String(song?.id));

  const handleDownload = (target: Song) => {
    downloadSong(target.id);
  };

  return (
    <div>
      <Layout>
        {loading || songsLoading ? (
          <Loading />
        ) : !song ? (
          <div className="mt-10 text-[var(--mc-text-muted)]">
            <h2 className="text-2xl font-bold mb-2 text-[var(--mc-text)]">Song not found</h2>
            <p>This song could not be loaded{songError ? ` — ${songError}` : ""}.</p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-6 px-5 py-2 rounded-full bg-[#8E82FF] hover:opacity-90 text-white transition"
            >
              Back to home
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-center">
              <img
                src={song.thumbnail ? song.thumbnail : "/download.jpeg"}
                className="w-48 rounded"
                alt=""
              />

              <div className="flex flex-col">
                <p className="text-[var(--mc-text-muted)]">Song</p>
                <h2 className="text-3xl font-bold mb-4 md:text-5xl">{song.title}</h2>
                <h4 className="text-[var(--mc-text-muted)]">
                  {song.description || "No description"}
                </h4>
                <p
                  className="mt-1 flex items-center gap-2 cursor-pointer hover:underline"
                  onClick={() => song.album_id && navigate(`/album/${song.album_id}`)}
                >
                  <Logo className="inline-block w-6" tile={theme === "light"} />
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label={isPlaying && selectedSong === song.id ? "Pause" : "Play"}
                title={isPlaying && selectedSong === song.id ? "Pause" : "Play"}
                className="w-14 h-14 rounded-full bg-[#8E82FF] hover:opacity-90 text-white flex items-center justify-center text-2xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E82FF]"
                onClick={() => {
                  if (isPlaying && selectedSong === song.id) {
                    setIsPlaying(false);
                  } else {
                    setSelectedSong(song.id);
                    setIsPlaying(true);
                  }
                }}
              >
                {isPlaying && selectedSong === song.id ? <FaPause /> : <FaPlay />}
              </button>

              {isAuth && (
                <button
                  type="button"
                  aria-label={liked ? "Unlike song" : "Like song"}
                  title={liked ? "Unlike song" : "Like song"}
                  className="p-3 text-2xl text-center text-[var(--mc-icon)] rounded-full transition hover:text-[var(--mc-accent-text)] hover:bg-[var(--mc-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E82FF]"
                  onClick={() => toggleLike(String(song.id))}
                >
                  {liked ? <FaHeart className="text-[#FF4D6D]" /> : <FaRegHeart />}
                </button>
              )}

              {isAuth && (
                <button
                  type="button"
                  aria-label="Save to playlist"
                  title="Save to playlist"
                  className="p-3 text-2xl text-center text-[var(--mc-icon)] rounded-full transition hover:text-[var(--mc-accent-text)] hover:bg-[var(--mc-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E82FF]"
                  onClick={() => addToPlaylist(String(song.id))}
                >
                  <FaBookmark />
                </button>
              )}

              <button
                type="button"
                aria-label="Download song"
                title="Download song"
                className="p-3 text-2xl text-center text-[var(--mc-icon)] rounded-full transition hover:text-[var(--mc-accent-text)] hover:bg-[var(--mc-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E82FF]"
                onClick={() => handleDownload(song)}
              >
                <FaDownload />
              </button>
            </div>

            <hr className="border-[var(--mc-border)]" />

            <div className="mt-10 space-y-4">
              <h3 className="text-2xl font-bold">You may also like</h3>
              <div className="flex flex-wrap gap-4">
                {relatedSongs.length === 0 ? (
                  <p className="text-[var(--mc-text-muted)]">No other songs available.</p>
                ) : (
                  relatedSongs.map((item) => (
                    <SongCard
                      key={item.id}
                      id={item.id}
                      image={item.thumbnail ? item.thumbnail : "/download.jpeg"}
                      name={item.title}
                      description={item.description ? item.description.slice(0, 30) : "No description"}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Layout>
    </div>
  );
};

export default SongPage;