import { upload } from "./multer.middleware.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { asyncHandler2 } from "../utils/asyncHandler.js";

export const isFileAvailable =asyncHandler2((req, res, next) => {
    const Files = req.files;

    console.log(Files)

    next()
}) 

