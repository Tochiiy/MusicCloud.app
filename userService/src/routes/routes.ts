import express from 'express';
import { registerUser, loginUser, myProfile } from '../controllers/controllers.js';
import isAuth from '../middleware/isAuth.js';

const router = express.Router();


router.post("/user/register", registerUser);
router.post("/user/login",    loginUser);
router.get("/user/profile",   isAuth, myProfile);


export default router;