import { Router } from "express";
import {
    createLike,
    removeLike
    } from "../controller/Like.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
const router = Router();

router.route('/like').post(verifyJWT, createLike)

router.route('/remove-like').post(verifyJWT, removeLike)