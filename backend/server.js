import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

// Routes
import userRouter from "./src/routes/user.route.js";
import authRoutes from "./src/routes/auth.router.js";
import contactRouter from "./src/routes/contact.route.js";
import Chatrouter from "./src/routes/chat.route.js";

// Models
import Message from "./src/models/Chat.model.js";
import User from "./src/models/user.model.js";

import "./src/config/passport.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const origin = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

// Middleware
app.use(cors({ origin, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", Chatrouter);
app.use("/api/users", userRouter);
app.use("/api/contact", contactRouter);

// Connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// ---------------- Chat via Socket.IO ---------------- //
const io = new Server(server, {
  cors: { origin, credentials: true },
});

const onlineUsers = new Map();

// Authenticate socket connection with JWT (from socket.handshake.auth.token)
io.use(async (socket, next) => {
  try {
    let token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));
    token = token.startsWith("Bearer ") ? token.slice(7) : token;
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    socket.userId = decoded.id || decoded.sub;

    // Fetch username for senderName
    const user = await User.findById(socket.userId);
    socket.userName = user?.username || "Unknown";

    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  onlineUsers.set(socket.userId, socket.id);
  console.log("User connected:", socket.userId);

  // Private message event
  socket.on("private_message", async ({ to, text }) => {
    try {
      const message = await Message.create({
        from: socket.userId,
        to,
        text,
      });

      // Add senderName before emitting
      const messageWithName = {
        ...message.toObject(),
        senderName: socket.userName,
      };

      // Send to receiver if online
      const receiverSocket = onlineUsers.get(to);
      if (receiverSocket) {
        io.to(receiverSocket).emit("private_message", messageWithName);
      }

      // Send back to sender to ensure real-time UI update
      socket.emit("private_message", messageWithName);
    } catch (err) {
      console.error("Message error:", err);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
    console.log("User disconnected:", socket.userId);
  });
});

// ---------------- Start Server ---------------- //
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
