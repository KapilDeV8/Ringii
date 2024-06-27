const asyncHandler1 = (fn) => async(req,res,next) => {
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(500).json({
            message: "Request failed due to some fucking reason",
            succes: false
        })
    }
}

const asyncHandler2 = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export {asyncHandler1, asyncHandler2}
