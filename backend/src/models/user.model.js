import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    Phone: String,
    googleId: String,
    phone: String,
    linkedInId: String,
    instgramId: String,
    githubId: String,
}, { timestamps: true });

export default mongoose.model("User", userSchema);
