import express from "express";
import passport from "passport";
import { signup, signin, refreshToken, logout, googleCallback } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { session: false }), googleCallback);

export default router;
