// controllers/user.controller.js
import User from "../models/user.model.js";


export const getAllUsers = async (req, res) => {
  console.log('hit me backend')
  try {
    const currentUserId = req.user.id; // get logged-in user ID from JWT

    // Fetch all users except the current logged-in user
    const users = await User.find({ _id: { $ne: currentUserId } }).select("-password");

    res.json(users); // return users without passwords
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




export const addUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully", user });
  } catch (err) {   
    res.status(500).json({ message: err.message });
  } 
};