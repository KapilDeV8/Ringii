import mongoose from "mongoose";
import { Like } from "../models/Like.model.js";
import asyncHandler2 from '../utils/asyncHandler.js'
import { ApiError } from "../utils/ApiError.js";
import  ApiResponse from '../utils/ApiResponse.js'

const createLike = asyncHandler2( async (req, res) => {
    const LikedOn = req.body;

    if(!LikedOn) {
        throw new ApiError(400, 'Cannot fetch like')
    }

    const user = req.user?._id;

    if(!user) {
        throw new ApiError(400, 'Cannot fetch user!')
    }

    Like.create(
        {
            LikedOn,
            LikedBy: user?._id
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, 'Like Added')
    )
});

const removeLike = asyncHandler2(async (req, res) => {
    const removeOn = req.body;

    if(!removeOn) {
        throw new ApiError(400, 'Cannot remove Like!')
    }

    const user = req.user?._id;

    if(!user) {
        throw new ApiError(400, 'Cannot fetch user!')
    }
    
    await Like.findOneAndDelete({ $all: [user, removeOn]})
    return res
    .status(200)
    .json(200, {}, 'Liked removed successfully')
})

export {
    createLike,
    removeLike
}