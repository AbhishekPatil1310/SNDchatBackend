import { sendContactMessage } from "../controller/contact.controller.js";
import express from "express";

const contactRouter = express.Router();
contactRouter.post("/sendMessage", sendContactMessage);

export default contactRouter;