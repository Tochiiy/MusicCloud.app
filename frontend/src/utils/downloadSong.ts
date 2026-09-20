const server =
  import.meta.env.VITE_SONG_SERVER_URL || 'http://localhost:8000';

/**
 * Stream a song download directly to the browser instead of buffering the
 * whole file in memory. The download endpoint is public, so a plain anchor is
 * enough (no auth headers required). If auth is ever added to the endpoint,
 * replace this with an authenticated `fetch` + blob approach.
 */
export function downloadSong(songId: number): void {
  const link = document.createElement('a');

  link.href = `${server}/api/v1/songs/${songId}/download`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  document.body.appendChild(link);
  link.click();
  link.remove();
}