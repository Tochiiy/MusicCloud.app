import { useEffect, useMemo, useRef, useState } from "react";
import AlbumCard from "../components/AlbumCard";
import SongCard from "../components/SongCard";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import { ThemeToggle } from "../components/theme";
import { useSongContext } from "../context/songContext";
import { FiSearch } from "react-icons/fi";

const Search = () => {
  const { albums, songs, loading } = useSongContext();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setDebouncedQuery(query);
      timerRef.current = null;
    }, 300);
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [query]);

  const q = debouncedQuery.trim().toLowerCase();
  const isDebouncing = query.trim() !== debouncedQuery.trim();

  const songHits = useMemo(
    () =>
      q === ""
        ? []
        : songs.filter(
            (song) =>
              song.title.toLowerCase().includes(q) ||
              (song.description ?? "").toLowerCase().includes(q)
          ),
    [songs, q]
  );

  const albumHits = useMemo(
    () =>
      q === ""
        ? []
        : albums.filter(
            (album) =>
              album.title.toLowerCase().includes(q) ||
              (album.description ?? "").toLowerCase().includes(q)
          ),
    [albums, q]
  );

  if (loading) return <Loading />;

  const noResults = q !== "" && songHits.length === 0 && albumHits.length === 0;

  return (
    <div>
      <Layout>
        <div className="mb-4 flex justify-end">
          <ThemeToggle />
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-bold my-5">Search</h1>
          <div className="relative">
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mc-icon)]"
              size={20}
            />
            <input
              type="search"
              value={query}
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs and albums..."
              className="w-full rounded-full border border-[var(--mc-border)] bg-[var(--mc-surface)] px-12 py-3 text-[var(--mc-text)] placeholder:text-[var(--mc-text-muted)] outline-none transition focus:border-[#6C5CFF] focus:ring-2 focus:ring-[#6C5CFF]/40"
            />
          </div>
          {isDebouncing && (
            <p className="mt-2 text-sm text-[var(--mc-text-muted)]">
              Searching...
            </p>
          )}
        </div>

        {noResults && (
          <p className="text-[var(--mc-text-muted)]">
            No results for "{query.trim()}".
          </p>
        )}

        {songHits.length > 0 && (
          <div className="mb-4">
            <h1 className="text-2xl font-bold my-5">
              Songs{" "}
              <span className="text-[var(--mc-text-muted)]">({songHits.length})</span>
            </h1>
            <div className="flex flex-wrap">
              {songHits.map((e, i) => (
                <SongCard key={i} image={e.thumbnail} name={e.title} description={e.description ?? ""} id={e.id} />
              ))}
            </div>
          </div>
        )}

        {albumHits.length > 0 && (
          <div className="mb-4">
            <h1 className="text-2xl font-bold my-5">
              Albums{" "}
              <span className="text-[var(--mc-text-muted)]">({albumHits.length})</span>
            </h1>
            <div className="flex flex-wrap">
              {albumHits.map((e, i) => (
                <AlbumCard key={i} image={e.thumbnail} name={e.title} desc={e.description ?? ""} id={e.id} />
              ))}
            </div>
          </div>
        )}
      </Layout>
    </div>
  );
};

export default Search;