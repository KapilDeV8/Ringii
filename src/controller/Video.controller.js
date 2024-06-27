import mongoose from "mongoose";
import { Video } from '../models/Video.model.js'
import { asyncHandler2 } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js'
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const uploadVideo = asyncHandler2(async (req, res) => {
    const { title, description, views, isPublished } = req.body;
    const owner = req.user?._id;
    console.log(owner)
    if (!title || !description) {
        throw new ApiError(400, 'All feilds are required to upload a video!')
    }

    const videoFile = req.files?.videoFile[0]?.path;
    const thumbnail = req.files?.thumbnail[0]?.path;

    if (!videoFile || !thumbnail) {
        throw new ApiError(400, 'Please upload a video file and a thumbnail')
    }

    const newVideo = await uploadOnCloudinary(videoFile);
    const newThumbnail = await uploadOnCloudinary(thumbnail);

    const uploadedVideo = await Video.create(
        {
            videoFile: newVideo?.url,
            thumbnail: newThumbnail?.url,
            title,
            description,
            duration: newVideo?.duration,
            views,
            isPublished,
            owner
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, uploadedVideo, 'Video uploaded successfully!')
        )
})

const deleteVideo = asyncHandler2(async (req, res) => {

    const { _id } = req.body

    const video = await Video.findById({ _id })

    if (!video) {
        throw new ApiError(404, 'Video not found in DB!')
    }

    const deletedVideo = await Video.deleteOne(video)

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, 'Video Deleted successfully!')
        )
})

const updateThumbnail = asyncHandler2(async (req, res) => {

    const thumbnail = req.file?.path

    const { _id } = req.body

    if (!thumbnail) {
        throw new ApiError(400, 'Image cannot reach server')
    }

    const newThumbnail = await uploadOnCloudinary(thumbnail)

    const video = await Video.findByIdAndUpdate(
        _id,
        {
            $set: {
                thumbnail: newThumbnail?.url
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, 'Thumbnail updated successfully')
        )

})

const updateTitle = asyncHandler2(async (req, res) => {

    const { _id, title } = req.body;

    if (!_id) {
        throw new ApiError(400, 'Video not found on server!')
    }

    if(!title){
        throw new ApiError(400, 'Title provided cannot reach server!')
    }

    const video = await Video.findByIdAndUpdate(
        _id,
        {
            $set: {
                title
            }
        },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, 'Title updated successfully')
        )
})

const updateDescription = asyncHandler2(async (req, res) => {

    const {_id, description} = req.body

    if(!_id){
        throw new ApiError(400, 'Video not found on server')
    }

    if(!description){
        throw new ApiError(400, 'Description not found on server')
    }

    const video = await Video.findByIdAndUpdate(
        _id,
        {
            $set: {
                description
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, 'Description updated successfully')
    )
})


export {
    uploadVideo,
    deleteVideo,
    updateThumbnail,
    updateTitle,
    updateDescription
}
