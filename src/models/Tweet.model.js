import mongoose from "mongoose";

const tweetSchema = mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: {
            type: String,
            required: true
        },
        Likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Like"
            }
        ],
        Comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }
        ]
    },
    {
    timestamps: true
    }
)

export const Tweet = mongoose.model('Tweet', tweetSchema)