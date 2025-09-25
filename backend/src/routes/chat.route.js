import express from 'express';
import { getConversation, postMessage } from '../controller/Chat.controller.js';
import { verifyToken } from '../middleware/authmiddleware.js';


const Chatrouter = express.Router();


// GET conversation with a specific user
Chatrouter.get('/:userId', verifyToken, getConversation);


// POST a new message
Chatrouter.post('/:userId', verifyToken, postMessage);


export default Chatrouter;