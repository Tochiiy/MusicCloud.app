import { useMemo } from "react";
import Layout from "../components/Layout";
import { useSongContext } from "../context/songContext";
import { useUserData } from "../context/userContext";
import { FaBookmark, FaDownload, FaPause, FaPlay, FaHeart, FaRegHeart } from "react-icons/fa6";
import { FiAlignLeft, FiSettings } from "react-icons/fi";
import Loading from "../components/Loading";
import Logo from "../components/Logo";
import { useTheme } from "../components/themeContext";
import { downloadSong } from "../utils/downloadSong";
import type { Song } from "../types";

const PlayList = () => {
  const { songs, setIsPlaying, setSelectedSong, selectedSong, isPlaying, loading } = useSongContext();

  const { user, addToPlaylist, toggleLike } = useUserData();

  const { theme } = useTheme();

  const myPlayList = useMemo(
    () =>
      songs.filter((song) =>
        user?.playlist?.includes(song.id.toString())
      ),
    [songs, user]
  );

  const handleDownload = (song: Song) => {
    downloadSong(song.id);
  };

  return (
    <div>
      <Layout>
        {myPlayList && (
          <>
            {loading ? (
              <Loading />
            ) : (
              <>
                <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-center">
                  <img src={"/download.jpeg"} className="w-48 rounded" alt="" />

                  <div className="flex flex-col">
                    <p className="text-[var(--mc-text-muted)]">PlayList</p>
                    <h2 className="text-3xl font-bold mb-4 md:text-5xl">
                      {user?.name} PlayList
                    </h2>
                    <h4 className="text-[var(--mc-text-muted)]">Your Favourate songs</h4>
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
                {myPlayList &&
                  myPlayList.map((song, index) => {
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

                          <button
                            type="button"
                            aria-label="Remove from playlist"
                            title="Remove from playlist"
                            className="p-2.5 text-lg text-center text-[var(--mc-icon)] rounded-full transition hover:text-[var(--mc-accent-text)] hover:bg-[var(--mc-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E82FF]"
                            onClick={() => addToPlaylist(String(song.id))}
                          >
                            <FaBookmark />
                          </button>

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
            )}
          </>
        )}
      </Layout>
    </div>
  );
};

export default PlayList;