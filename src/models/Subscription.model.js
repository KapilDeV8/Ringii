import mongoose, { Schema } from "mongoose";
const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing!
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // one whom channel is getting subscribed!
        ref: "User"
    }
}, {timestamps: true});

export const Subscription = mongoose.model("Subscription", subscriptionSchema)