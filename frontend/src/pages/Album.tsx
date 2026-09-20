import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useSongContext } from "../context/songContext";
import { useEffect, useState } from "react";
import AlbumLoading from "../components/AlbumLoading";
import { FaBookmark, FaDownload, FaPause, FaPlay } from "react-icons/fa6";
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

  const { isAuth, addToPlaylist } = useUserData();

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
                    <p>PlayList</p>
                    <h2 className="text-3xl font-bold mb-4 md:text-5xl">
                      {albumData.title} PlayList
                    </h2>
                    <h4>{albumData.description}</h4>
                    <p className="mt-1">
                      <img
                        src="/logo.png"
                        className="inline-block w-6"
                        alt=""
                      />
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
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

                <hr />
                {albumSong &&
                  albumSong.map((song, index) => {
                    return (
                      <div
                        className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
                        key={index}
                      >
                        <p className="text-white">
                          <b className="mr-4 text-[#a7a7a7]">{index + 1}</b>
                          <img
                            src={
                              song.thumbnail ? song.thumbnail : "/download.jpeg"
                            }
                            className="inline w-10 mr-5"
                            alt=""
                          />{" "}
                          {song.title}
                        </p>
                        <p className="text-[15px] hidden sm:block">
                          {song.description?.slice(0, 30)}...
                        </p>
                        <p className="flex justify-center items-center gap-5">
                          {isAuth && (
                            <button
                              type="button"
                              aria-label="Save to playlist"
                              title="Save to playlist"
                              className="text-[15px] text-center text-[#a7a7a7] rounded transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E82FF]"
                              onClick={() => addToPlaylist(String(song.id))}
                            >
                              <FaBookmark />
                            </button>
                          )}
                          <button
                            type="button"
                            aria-label={isPlaying && selectedSong === song.id ? "Pause" : "Play"}
                            title={isPlaying && selectedSong === song.id ? "Pause" : "Play"}
                            className="text-[15px] text-center text-[#a7a7a7] rounded transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E82FF]"
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
                            className="text-[15px] text-center text-[#a7a7a7] rounded transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E82FF]"
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