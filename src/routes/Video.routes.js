import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    uploadVideo,
    deleteVideo,
    updateThumbnail,
    updateTitle,
    updateDescription
} from '../controller/Video.controller.js'

const router = Router();

router.route('/upload-video').post(
    verifyJWT,
    upload.fields([
        {
            name: 'videoFile',
            maxCount: 1
        },
        {
            name: 'thumbnail',
            maxCount: 1
        }
    ]),
    uploadVideo
)

router.route('/delete-video').delete(verifyJWT, deleteVideo)

router.route('/update-thumbnail').patch(verifyJWT, upload.single('thumbnail') ,updateThumbnail)

router.route('/update-title').patch(verifyJWT, updateTitle)

router.route('/update-description').patch(verifyJWT, updateDescription)


export default router;