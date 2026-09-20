import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useSongContext } from "../context/songContext";
import { useEffect, useState } from "react";
import AlbumLoading from "../components/AlbumLoading";
import Logo from "../components/Logo";
import { useTheme } from "../components/themeContext";
import { FaBookmark, FaDownload, FaPause, FaPlay, FaHeart, FaRegHeart } from "react-icons/fa6";
import { FiAlignLeft, FiSettings } from "react-icons/fi";
import { useUserData } from "../context/userContext";
import toast from "react-hot-toast";
import type { Song } from "../types";

const server = import.meta.env.VITE_SONG_SERVER_URL || "http://localhost:8000";

const Album = () => {
  const params = useParams<{ id: string }>();
  return <AlbumContent key={params.id ?? "none"} params={params} />;
};

const AlbumContent = ({ params }: { params: { id?: string } }) => {
  const {
    fetchAlbumsongs,
    albumSong,
    albumData,
    setIsPlaying,
    setSelectedSong,
    selectedSong,
    isPlaying,
  } = useSongContext();

  const { isAuth, addToPlaylist, toggleLike, user } = useUserData();

  const { theme } = useTheme();

  const [albumLoading, setAlbumLoading] = useState(true);

  const handleDownload = async (song: Song) => {
    try {
      const response = await fetch(`${server}/api/v1/songs/${song.id}/download`);
      if (!response.ok) {
        toast.error("Failed to download song");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${song.title || "song"}.mp3`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download song");
    }
  };

  useEffect(() => {
    if (!params.id) return;
    fetchAlbumsongs(params.id).finally(() => setAlbumLoading(false));
  }, [params.id, fetchAlbumsongs]);
  return (
    <div>
      <Layout>
        {albumLoading ? (
          <AlbumLoading />
        ) : (
          albumData && (
            <>
              <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-center">
                  {albumData.thumbnail && (
                    <img
                      src={albumData.thumbnail}
                      className="w-48 rounded"
                      alt=""
                    />
                  )}

                  <div className="flex flex-col">
                    <p className="text-[var(--mc-text-muted)]">PlayList</p>
                    <h2 className="text-3xl font-bold mb-4 md:text-5xl">
                      {albumData.title} PlayList
                    </h2>
                    <h4 className="text-[var(--mc-text-muted)]">{albumData.description}</h4>
                    <p className="mt-1">
                      <Logo className="inline-block w-6" tile={theme === "light"} />
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] sm:grid-cols-4 mt-10 mb-4 pl-2 text-[var(--mc-text-muted)]">
                  <p>
                    <b className="mr-4">#</b>
                  </p>
                  <p className="hidden sm:block">
                    <FiAlignLeft className="inline mr-1" /> <b>Description</b>
                  </p>
                  <p className="text-center">
                    <FiSettings className="inline mr-1" /> <b>Actions</b>
                  </p>
                </div>

                <hr className="border-[var(--mc-border)]" />
                {albumSong &&
                  albumSong.map((song, index) => {
                    return (
                      <div
                        className="grid grid-cols-[1fr_auto] sm:grid-cols-4 mt-10 mb-4 pl-2 text-[var(--mc-text-muted)] hover:bg-[var(--mc-hover)] cursor-pointer"
                        key={index}
                      >
                        <p className="flex items-center min-w-0 pr-2 text-[var(--mc-text)]">
                          <b className="mr-2 shrink-0 text-[var(--mc-text-muted)]">{index + 1}</b>
                          <img
                            src={
                              song.thumbnail ? song.thumbnail : "/download.jpeg"
                            }
                            className="inline w-10 mr-3 shrink-0"
                            alt=""
                          />
                          <span className="truncate">{song.title}</span>
                        </p>
                        <p className="text-[15px] hidden sm:block">
                          {song.description?.slice(0, 30)}...
                        </p>
                        <p className="flex justify-center items-center gap-4">
                          {isAuth && (
                            <button
                              type="button"
                              aria-label={(user?.likedSongs ?? []).includes(String(song.id)) ? "Unlike song" : "Like song"}
                              title={(user?.likedSongs ?? []).includes(String(song.id)) ? "Unlike song" : "Like song"}
                              className="p-2.5 text-lg text-center text-[var(--mc-icon)] rounded-full transition hover:text-[var(--mc-accent-text)] hover:bg-[var(--mc-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E82FF]"
                              onClick={() => toggleLike(String(song.id))}
                            >
                              {(user?.likedSongs ?? []).includes(String(song.id)) ? (
                                <FaHeart className="text-[#FF4D6D]" />
                              ) : (
                                <FaRegHeart />
                              )}
                            </button>
                          )}
                          {isAuth && (
                            <button
                              type="button"
                              aria-label="Save to playlist"
                              title="Save to playlist"
                              className="p-2.5 text-lg text-center text-[var(--mc-icon)] rounded-full transition hover:text-[var(--mc-accent-text)] hover:bg-[var(--mc-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E82FF]"
                              onClick={() => addToPlaylist(String(song.id))}
                            >
                              <FaBookmark />
                            </button>
                          )}
                          <button
                            type="button"
                            aria-label={isPlaying && selectedSong === song.id ? "Pause" : "Play"}
                            title={isPlaying && selectedSong === song.id ? "Pause" : "Play"}
                            className="p-2.5 text-lg text-center text-[var(--mc-icon)] rounded-full transition hover:text-[var(--mc-accent-text)] hover:bg-[var(--mc-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E82FF]"
                            onClick={() => {
                              if (isPlaying && selectedSong === song.id) {
                                setIsPlaying(false);
                              } else {
                                setSelectedSong(song.id);
                                setIsPlaying(true);
                              }
                            }}
                          >
                            {isPlaying && selectedSong === song.id ? (
                              <FaPause />
                            ) : (
                              <FaPlay />
                            )}
                          </button>
                          <button
                            type="button"
                            aria-label="Download song"
                            title="Download song"
                            className="p-2.5 text-lg text-center text-[var(--mc-icon)] rounded-full transition hover:text-[var(--mc-accent-text)] hover:bg-[var(--mc-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E82FF]"
                            onClick={() => handleDownload(song)}
                          >
                            <FaDownload />
                          </button>
                        </p>
                      </div>
                    );
                  })}
            </>
          )
        )}
      </Layout>
    </div>
  );
};

export default Album;