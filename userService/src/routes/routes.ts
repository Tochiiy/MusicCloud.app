import express from 'express';
import { registerUser, loginUser, myProfile, addToPlayList, toggleLike, getLikesSummary, getAllUsers, promoteUserToAdmin, logoutUser } from '../controllers/controllers.js';
import isAuth from '../middleware/isAuth.js';

const router = express.Router();


router.post("/user/register", registerUser);
router.post("/user/login",    loginUser);
router.get("/user/profile",   isAuth, myProfile);
router.get("/user/users",     isAuth, getAllUsers);
router.patch("/user/users/:userId/admin", isAuth, promoteUserToAdmin);
router.post("/user/playlist", isAuth, addToPlayList);
router.post("/user/like",     isAuth, toggleLike);
router.get("/user/likes/summary", isAuth, getLikesSummary);
router.post("/user/logout",   isAuth, logoutUser);

export default router;