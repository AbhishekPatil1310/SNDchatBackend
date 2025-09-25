import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed });
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

 res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({ message: "Signed up successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ message: "Invalid credentials" });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

   res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({ message: "Signed in successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const refreshToken = (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No token" });

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        const accessToken = generateAccessToken({ _id: user.id });
        res.json({ accessToken });
    });
};

export const logout = (req, res) => {
  // Clear accessToken cookie
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  // Clear refreshToken cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.json({ message: "Logged out successfully" });
};


export const googleCallback = (req, res) => {
    const accessToken = generateAccessToken(req.user);
    const refreshToken = generateRefreshToken(req.user);

    // Set both tokens as httpOnly cookies
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .redirect(`${process.env.FRONTEND_URL}/oauth`); // access token is now in cookie
};

