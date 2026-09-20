import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import { FaHeart } from "react-icons/fa6";
import toast from "react-hot-toast";
import AdminNav from "../components/AdminNav";
import { useSongContext } from "../context/songContext";
import { useUserData } from "../context/userContext";
import type { Album } from "../types";

const inputClass =
  "w-full rounded-full border border-white/10 bg-[#17142B] px-5 py-3 text-sm text-white " +
  "placeholder:text-white/40 outline-none transition " +
  "focus:border-[#6C5CFF] focus:ring-2 focus:ring-[#6C5CFF]/40";

const btnPrimary =
  "rounded-full bg-[#6C5CFF] px-6 py-2.5 text-sm font-semibold text-white transition " +
  "hover:bg-[#8E82FF] disabled:cursor-not-allowed disabled:opacity-60";

const cardClass = "rounded-3xl border border-white/10 bg-[#1E1A38] p-6 shadow-2xl";

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)
      ?.message;
    return message || fallback;
  }
  return fallback;
}

// Clear every native file input's displayed filename after a successful upload,
// since the inputs are uncontrolled and would otherwise keep showing the old file.
const resetFileInputs = () => {
  document
    .querySelectorAll('input[type="file"]')
    .forEach((input) => {
      (input as HTMLInputElement).value = "";
    });
};

const server =
  import.meta.env.VITE_ADMIN_SERVER_URL || "http://13.235.70.183:7000";

const userServer =
  import.meta.env.VITE_USER_SERVER_URL || "http://localhost:6100";

interface LikeCount {
  songId: string;
  count: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useUserData();

  const { albums, songs, fetchAlbums, fetchSongs } = useSongContext();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [album, setAlbum] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);

  const [likes, setLikes] = useState<LikeCount[]>([]);
  const [likesLoading, setLikesLoading] = useState<boolean>(true);

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const addAlbumHandler = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    setBtnLoading(true);

    try {
      const { data } = await axios.post(
        `${server}/api/v1/admin/album/new`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      fetchAlbums();
      setBtnLoading(false);
      setTitle("");
      setDescription("");
      setFile(null);
      resetFileInputs();
    } catch (error) {
      toast.error(getErrorMessage(error, "An error occurred"));
      setBtnLoading(false);
    }
  };

  const addSongHandler = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);
    formData.append("album", album);

    setBtnLoading(true);

    try {
      const { data } = await axios.post(`${server}/api/v1/admin/song/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success(data.message);
      fetchSongs();
      setBtnLoading(false);
      setTitle("");
      setDescription("");
      setFile(null);
      setAlbum("");
      resetFileInputs();
    } catch (error) {
      toast.error(getErrorMessage(error, "An error occurred"));
      setBtnLoading(false);
    }
  };

  const addThumbnailHandler = async (id: string | number) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setBtnLoading(true);

    try {
      const { data } = await axios.post(
        `${server}/api/v1/admin/song/thumbnail/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      fetchSongs();
      setBtnLoading(false);
      setFile(null);
      resetFileInputs();
    } catch (error) {
      toast.error(getErrorMessage(error, "An error occurred"));
      setBtnLoading(false);
    }
  };

  const deleteAlbum = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this album?")) {
      setBtnLoading(true);
      try {
        const { data } = await axios.delete(`${server}/api/v1/admin/album/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        toast.success(data.message);
        fetchSongs();
        fetchAlbums();
        setBtnLoading(false);
      } catch (error) {
        toast.error(getErrorMessage(error, "An error occurred"));
        setBtnLoading(false);
      }
    }
  };

  const deleteSong = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this song?")) {
      setBtnLoading(true);
      try {
        const { data } = await axios.delete(`${server}/api/v1/admin/song/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        toast.success(data.message);
        fetchSongs();
        setBtnLoading(false);
      } catch (error) {
        toast.error(getErrorMessage(error, "An error occurred"));
        setBtnLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadLikes = async () => {
      try {
        const { data } = await axios.get(`${userServer}/api/v1/user/likes/summary`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setLikes(data.likes ?? []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load likes"));
      } finally {
        setLikesLoading(false);
      }
    };
    loadLikes();
  }, []);

  return (
    <div className="min-h-screen bg-[#17142B] text-white p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin{" "}
              <span className="text-[#8E82FF]">Dashboard</span>
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Add albums and songs for the app.
            </p>
          </div>
          <AdminNav />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className={cardClass}>
            <h2 className="text-xl font-semibold text-white">
              Add <span className="text-[#8E82FF]">Album</span>
            </h2>
            <form className="mt-5 flex flex-col gap-4" onSubmit={addAlbumHandler}>
              <input
                type="text"
                placeholder="Title"
                className={inputClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Description"
                className={inputClass}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <input
                type="file"
                onChange={fileChangeHandler}
                className={inputClass}
                accept="image/*"
                required
              />
              <button type="submit" className={btnPrimary} disabled={btnLoading}>
                {btnLoading ? "Please Wait..." : "Add Album"}
              </button>
            </form>
          </section>

          <section className={cardClass}>
            <h2 className="text-xl font-semibold text-white">
              Add <span className="text-[#8E82FF]">Song</span>
            </h2>
            <form className="mt-5 flex flex-col gap-4" onSubmit={addSongHandler}>
              <input
                type="text"
                placeholder="Title"
                className={inputClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Description"
                className={inputClass}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <select
                className={inputClass}
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                required
              >
                <option value="">Choose Album</option>
                {albums?.map((e: Album, i: number) => {
                  return (
                    <option value={e.id} key={i}>
                      {e.title}
                    </option>
                  );
                })}
              </select>
              <input
                type="file"
                onChange={fileChangeHandler}
                className={inputClass}
                accept="audio/*"
                required
              />
              <button type="submit" className={btnPrimary} disabled={btnLoading}>
                {btnLoading ? "Please Wait..." : "Add Song"}
              </button>
            </form>
          </section>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-white">
            Added <span className="text-[#8E82FF]">Albums</span>
          </h2>
          <div className="mt-4 flex flex-wrap gap-4">
            {albums?.map((e, i) => {
              return (
                <div
                  className="w-56 rounded-2xl border border-white/10 bg-[#1E1A38] p-4 shadow-lg"
                  key={i}
                >
                  <img src={e.thumbnail} className="h-44 w-full rounded-xl object-cover" alt="" />
                  <h4 className="mt-3 font-bold text-white">{e.title.slice(0, 30)}</h4>
                  <p className="text-sm text-white/50">{(e.description ?? "").slice(0, 60)}</p>
                  <button
                    disabled={btnLoading}
                    className="mt-3 flex items-center gap-1 rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => deleteAlbum(e.id)}
                  >
                    <MdDelete />
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-white">
            Added <span className="text-[#8E82FF]">Songs</span>
          </h2>
          <div className="mt-4 flex flex-wrap gap-4">
            {songs?.map((e, i) => {
              return (
                <div
                  className="w-56 rounded-2xl border border-white/10 bg-[#1E1A38] p-4 shadow-lg"
                  key={i}
                >
                  {e.thumbnail ? (
                    <img src={e.thumbnail} className="h-44 w-full rounded-xl object-cover" alt="" />
                  ) : (
                    <div className="flex h-44 w-full flex-col items-center justify-center gap-2">
                      <input type="file" onChange={fileChangeHandler} />
                      <button
                        className={btnPrimary}
                        disabled={btnLoading}
                        onClick={() => addThumbnailHandler(e.id)}
                      >
                        {btnLoading ? "Please Wait..." : "Add Thumbnail"}
                      </button>
                    </div>
                  )}

                  <h4 className="mt-3 font-bold text-white">{e.title.slice(0, 30)}</h4>
                  <p className="text-sm text-white/50">{(e.description ?? "").slice(0, 60)}</p>
                  <button
                    disabled={btnLoading}
                    className="mt-3 flex items-center gap-1 rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => deleteSong(e.id)}
                  >
                    <MdDelete />
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-white">
            Liked <span className="text-[#8E82FF]">Reactions</span>
          </h2>
          {likesLoading ? (
            <p className="mt-4 text-white/50">Loading likes...</p>
          ) : likes.length === 0 ? (
            <p className="mt-4 text-white/50">No songs liked yet.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {likes.map((like, i) => {
                const song = songs.find((s) => s.id === Number(like.songId));
                return (
                  <div
                    key={like.songId}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#1E1A38] p-4 shadow-lg"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-6 shrink-0 text-center font-bold text-white/60">
                        {i + 1}
                      </span>
                      <img
                        src={song?.thumbnail ?? "/download.jpeg"}
                        className="h-10 w-10 shrink-0 rounded object-cover"
                        alt=""
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {song?.title ?? `Song #${like.songId}`}
                        </p>
                        <p className="truncate text-sm text-white/50">
                          {song?.description ?? ""}
                        </p>
                      </div>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#6C5CFF]/20 px-3 py-1 text-sm font-semibold text-[#8E82FF]">
                      <FaHeart className="text-[#FF4D6D]" />
                      {like.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Admin;