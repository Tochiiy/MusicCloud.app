import express from 'express';
import { getAllSongs, getAllAlbums, getAllSongsOfAlbum, getSingleSong, downloadSong } from '../controllers/songController.js';

const router = express.Router();

router.get('/songs', getAllSongs);
router.get('/albums', getAllAlbums);
router.get('/albums/:albumId/songs', getAllSongsOfAlbum);
router.get('/songs/:songId', getSingleSong);
router.get('/songs/:songId/download', downloadSong);

export default router;