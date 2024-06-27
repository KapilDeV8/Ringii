import { asyncHandler2 } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from '../models/User.model.js'
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessAndRefreshTokens = async function (userId) {
    try {
        const user =  await User.findById(userId);
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        

        user.refreshToken = await refreshToken;
        
        await user.save({validateBeforeSave : false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Sorry something went wrong while generating access or refresh tokens!")
    }
}
 
const registerUser = asyncHandler2(async (req, res) => {
    //Get User Details from frontEnd
    const { fullName, email, userName, password } = req.body;
    //Validation check
    if ([
        fullName, email, userName, password
    ].some((field) =>
        field?.trim() === ""
    )) {
        throw new ApiError(400, "fullName is required")
    }
    //Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, 'User with email or userName already exists')
    }
    //Check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;


    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, 'AvatarImage is required!')
    }
    //upload on cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverimage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400, 'AvatarImage is required!')
    }
    //create user object - create entry in db
    const USER = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverimage?.url || "" ,
        email,
        password,
        userName: userName.toLowerCase()
    })


    //remove password and refresh token field from response

    const createdUser = await User.findById(USER._id).select(
        "-password -refreshToken"
    )


    //check user creation 

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    //return response

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )


});

const logInUser = asyncHandler2(async (req, res) => {
    // Steps:
    // 1: Getting user data from frontEnd

    const  {email, username, password} = req.body;
    
    if (!username && !email) {
        throw new ApiError(400, "username and email is required!")
    }

    // 2: Checking if user really exists

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user) {
        throw new ApiError(404, "This user does not exists!")
    }

    // 3: Checking whether the password is correct

    const passWord = await user.isPasswordCorrect(password);
    if(!passWord) {
        throw new ApiError(401, "Incorrect information!")
    }


    // 4: access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");



    // 5: sending tokens in form of cookies and sending response

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In successfuly"
        )
    )
});

const logOutUser = asyncHandler2(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset : {
            refreshToken: 1
        }
        },
        {
            new: true
        }
        )
        const options = {
            httpOnly: true,
            secure: true
        }
        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
});

const refreshAccessToken = asyncHandler2(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Authorization failed while fetching cookies");
    }

    try {
        const decodedIncomingRefreshToken =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedIncomingRefreshToken?._id)
        
        if(!user) {
            throw new ApiError(401, "Invalud user found ")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token already used!")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', newRefreshToken, options)
        .json(
            new ApiResponse(200, {accessToken, refreshToken: newRefreshToken},
                'Access token refreshed successfully!'
            )
        )
    } catch (error) {
        throw new ApiError(500, error?.message || 'Invalid refresh token found!')
    }
});

const changeCurrentPassword = asyncHandler2( async (req, res) => {
    const {oldPassword ,password} = req.body;

    const user = await User.findById(req.user?._id);

    const isOldPassword = await user.isPasswordCorrect(oldPassword)

    if(!isOldPassword){
        throw new ApiError(400, "Invalid Password")
    }

    user.password = password;
    await user.save({validateBeforeSave: false})
    return res
    .status(200)
    .json(new ApiResponse (200, {}, "Password updated successfully!"))
})

const getCurrentUser = asyncHandler2( async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched successfully!")) 
})

const updateAccountDetails = asyncHandler2(async (req, res)=> {
    const {fullName, email,} = req.body;

    if(!fullName || !email) {
        throw new ApiError(400, "All feilds are required!")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true
        }
    ).select('-password')

    return res
    .status(200)
    .json(new ApiResponse(200, user,  "Account details updated successfully!"))
})

const updateUserAvatar = asyncHandler2(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar was not fetched successfully!")
    }
    const newAvatar = await uploadOnCloudinary(avatarLocalPath);

    if(!newAvatar.url){
        throw new ApiError(500, "Error occured while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
    {
        $set: {
            avatar: newAvatar.url
        }
    },
    {
        new:  true
    }
    ).select('-password')

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler2(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image was not fetched successfully!")
    }
    const newCoverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!newCoverImage.url){
        throw new ApiError(500, "Error occured while uploading Cover Image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
    {
        $set: {
            coverImage: newCoverImage.url
        }
    },
    {
        new:  true
    }
    ).select('-password')

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"))
})

const getUserChannelProfile = asyncHandler2(async (req,res) => {
    const {username} = req.params;

    if(!username?.trim()) {
        throw new ApiError(400, "Username is missing!")
    }

    // 2 methods to get channel profile

    // 1: Using finding in DB
    // const channelProfile = await User.find({username})

    // 2: Using aggregation pipeline!
    const channel = await User.aggregate([
        {
            $match : {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignFeild: "channel",
                as: "susbscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignFeild: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedTo: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
                
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedTo: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            } 
        }
    ])

    if(!channel?.length) {
        throw new ApiError(404, "Channel does not exists!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "Channel fetched successfully!")
    )
})

const getWatchHistory = asyncHandler2(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignFeild: '_id',
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignFeild: "_id",
                            as: "owner",
                            pipeline: {
                                $project: {
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "Watch History fetched successfully!"))
})


export {
    registerUser,
    logInUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
 }

