import {uploadVideoToSupabase } from '../services/supabase.js'
import Message from '../models/Chat.model.js';

// GET conversation with a specific user
export const getConversation = async (req, res) => {
  const otherId = req.params.userId; // user to chat with
  const me = req.user.id; // use sub from JWT payload

  try {
    const messages = await Message.find({
      $or: [
        { from: me, to: otherId },
        { from: otherId, to: me },
      ],
    }).sort('createdAt');

    res.json(messages);
  } catch (err) {
    console.error('GET conversation error:', err);
    res.status(500).json({ message: err.message });
  }
};

// POST a new message to a specific user
export const postMessage = async (req, res) => {
  const from = req.user.id;
  const { to, text } = req.body; // send 'to' in body now

  if (!text || !to) return res.status(400).json({ message: 'Message text and recipient are required' });

  try {
    const message = await Message.create({ from, to, text });
    res.status(201).json(message);
  } catch (err) {
    console.error('POST message error:', err);
    res.status(500).json({ message: err.message });
  }
};


export const uploadVideoMessage = async (req, res) => {
  try {
    const from = req.user.id;
    const to = req.params.userId;

    if (!req.file)
      return res.status(400).json({ message: "No video file provided" });

    const videoUrl = await uploadVideoToSupabase(
      req.file.buffer,
      `${Date.now()}-${req.file.originalname}`,
      req.file.mimetype
    );

    const message = await Message.create({
      from,
      to,
      videoUrl,
    });

    res.status(201).json(message);

  } catch (err) {
    console.error("Video upload error:", err);
    res.status(500).json({ message: err.message });
  }
};
