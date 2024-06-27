import { Tweet } from '../models/Tweet.model.js'
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler2 } from '../utils/asyncHandler.js';

const uploadTweet = asyncHandler2((req, res)=>{
    
    console.log(req.body)
})


export {
    uploadTweet
}