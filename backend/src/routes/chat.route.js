import express from 'express';
import multer from 'multer';

import {
  getConversation,
  postMessage,
  uploadVideoMessage
} from '../controller/Chat.controller.js';

import { verifyToken } from '../middleware/authmiddleware.js';

const Chatrouter = express.Router();

// Multer for handling video uploads
const upload = multer({ storage: multer.memoryStorage() });

// =========================
// ROUTES
// =========================

// Get chat with specific user
Chatrouter.get('/:userId', verifyToken, getConversation);

// Send a text message
Chatrouter.post('/:userId', verifyToken, postMessage);

// Send a video message
Chatrouter.post(
  '/upload-video/:userId',
  verifyToken,
  upload.single("video"),   // Form-data field name
  uploadVideoMessage
);

export default Chatrouter;
