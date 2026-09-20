const dotenv = require('dotenv')
dotenv.config({ quiet: true })
const { Pool } = require('@neondatabase/serverless')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const audio = (n) => `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`
const thumb = (seed) => `https://picsum.photos/seed/${seed}/300/300`

const albums = [
  ['90s Throwback', 'Best of the 90s classics', thumb('album-90s')],
  ['Chill Beats', 'Relaxing lo-fi beats', thumb('album-chill')],
  ['Party Anthems', 'High energy party hits', thumb('album-party')],
  ['Acoustic Moods', 'Soft acoustic sessions', thumb('album-acoustic')],
  ['Synthwave Nights', 'Retro synthwave vibes', thumb('album-synthwave')],
]

const songs = [
  ['Neon Sky', 'Synthwave instrumental', thumb('song-neon-sky'), audio(1), 'Synthwave Nights'],
  ['Midnight Drive', 'Late night driving tune', thumb('song-midnight-drive'), audio(2), 'Synthwave Nights'],
  ['Golden Hour', 'Warm acoustic piece', thumb('song-golden-hour'), audio(3), 'Acoustic Moods'],
  ['Electric Dreams', 'Retro dance banger', thumb('song-electric-dreams'), audio(4), '90s Throwback'],
  ['Sunday Vibes', 'Laid back chill beat', thumb('song-sunday-vibes'), audio(5), 'Chill Beats'],
]

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL

;(async () => {
  const inserted = []

  for (const [title, description, thumbnail] of albums) {
    const exists = await pool.query('SELECT id FROM albums WHERE title = $1', [title])
    if (exists.rows.length > 0) {
      inserted.push(['album (skip)', title])
      continue
    }
    const res = await pool.query(
      'INSERT INTO albums (title, description, thumbnail) VALUES ($1, $2, $3) RETURNING id',
      [title, description, thumbnail]
    )
    inserted.push(['album', `'${title}' id=${res.rows[0].id}`])
  }

  for (const [title, description, thumbnail, audioUrl, albumTitle] of songs) {
    const exists = await pool.query('SELECT id FROM songs WHERE title = $1', [title])
    if (exists.rows.length > 0) {
      inserted.push(['song (skip)', title])
      continue
    }
    await pool.query(
      'INSERT INTO songs (title, description, thumbnail, audio, album_id) VALUES ($1, $2, $3, $4, (SELECT id FROM albums WHERE title = $5))',
      [title, description, thumbnail, audioUrl, albumTitle]
    )
    inserted.push(['song', title])
  }

  const resp = await fetch(`${UPSTASH_URL}/del`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['songs', 'albums']),
  })

  for (const [kind, detail] of inserted) {
    console.log(kind.padEnd(12), detail)
  }
  console.log('Cache invalidated:', resp.status)
  await pool.end()
})().catch((e) => {
  console.error(e.message)
  process.exit(1)
})