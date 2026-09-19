import express from 'express';
import { getAllSongs, getAllAlbums, getAllSongsOfAlbum, getSingleSong } from '../controllers/songController.js';

const router = express.Router();

router.get('/songs', getAllSongs);
router.get('/albums', getAllAlbums);
router.get('/albums/:albumId/songs', getAllSongsOfAlbum);
router.get('/songs/:songId', getSingleSong);

export default router;