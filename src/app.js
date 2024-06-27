import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// importing routes
import userRouter from './routes/User.routes.js'
import videoRouter from './routes/Video.routes.js'
import tweetRouter from './routes/Tweet.routes.js'
//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/video", videoRouter)
app.use("/api/v1/tweet", tweetRouter)
app.get("/user-using", (req ,res)=>{
    res.send("Bhaag ja bsdk")
})

export { app }
