import express from 'express';
import { addAlbum, addSong, addThumbnail,deleteAlbum,deleteSong,getAllUsers } from '../controllers/adminController.js';
import isAuth from '../middleware/isAuth.js';
import authorizeRole from '../middleware/authorizeRole.js';
import uploadFile from '../cloudinaryBlob/multer.js';

const router = express.Router();

router.get('/users', isAuth, authorizeRole(['admin']), getAllUsers);
router.post('/album/new', isAuth, authorizeRole(['admin']), uploadFile, addAlbum);
router.post('/song/new', isAuth, authorizeRole(['admin']), uploadFile, addSong);
router.post('/song/thumbnail/:songId', isAuth, authorizeRole(['admin']), uploadFile, addThumbnail);
router.delete('/album/:albumId', isAuth, authorizeRole(['admin']), deleteAlbum);
router.delete('/song/:songId', isAuth, authorizeRole(['admin']), deleteSong);

export default router;