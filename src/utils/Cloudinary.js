import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";



// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFIlePath) => {
  try {
    if (!localFIlePath) return null
    //upload file on cloudinary 
    const response = await cloudinary.uploader.upload(localFIlePath, {
      resource_type: "auto"
    })

    fs.unlinkSync(localFIlePath)
    return response

  } catch (error) {
    //remove locally saved temporary file as the upload operation got failed
    fs.unlinkSync(localFIlePath)
    return null
  }
}


export { uploadOnCloudinary }