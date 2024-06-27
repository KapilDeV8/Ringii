import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadTweet } from "../controller/Tweet.controller.js";
import { isFileAvailable } from '../middlewares/checkFile.middleware.js'

const router = Router();

router.route('/upload').post(verifyJWT, isFileAvailable, uploadTweet)

export default router;