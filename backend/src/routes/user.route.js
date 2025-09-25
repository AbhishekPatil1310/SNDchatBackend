import { getAllUsers,addUser,deleteUser,updateUser } from "../controller/user.controller.js";
import express from "express";
import {verifyToken} from "../middleware/authmiddleware.js";

const userRouter = express.Router();

userRouter.get("/getAllUser",verifyToken, getAllUsers);
userRouter.post("/addUser", addUser);
userRouter.delete("/deleteUser/:id", deleteUser);
userRouter.put("/updateUser/:id", updateUser);

export default userRouter;