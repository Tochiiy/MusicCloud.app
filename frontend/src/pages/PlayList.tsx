import { useMemo } from "react";
import Layout from "../components/Layout";
import { useSongContext } from "../context/songContext";
import { useUserData } from "../context/userContext";
import { FaBookmark, FaDownload, FaPause, FaPlay } from "react-icons/fa6";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import type { Song } from "../types";

const server = import.meta.env.VITE_SONG_SERVER_URL || "http://localhost:8000";

const PlayList = () => {
  const { songs, setIsPlaying, setSelectedSong, selectedSong, isPlaying, loading } = useSongContext();

  const { user, addToPlaylist } = useUserData();

  const myPlayList = useMemo(
    () =>
      songs.filter((song) =>
        user?.playlist?.includes(song.id.toString())
      ),
    [songs, user]
  );

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
                    <p>PlayList</p>
                    <h2 className="text-3xl font-bold mb-4 md:text-5xl">
                      {user?.name} PlayList
                    </h2>
                    <h4>Your Favourate songs</h4>
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
                  <p className="hidden sm:block">Description</p>
                  <p className="text-center">Actions</p>
                </div>

                <hr />
                {myPlayList &&
                  myPlayList.map((song, index) => {
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
                          <button
                            className="text-[15px] text-center"
                            onClick={() => addToPlaylist(String(song.id))}
                          >
                            <FaBookmark />
                          </button>

                          <button
                            className="text-[15px] text-center"
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
                            className="text-[15px] text-center"
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