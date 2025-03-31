import express from "express";
import { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword, deleteUserProfile,  } from "../controllers/userController.js";
import userAuth from "../middleware/userAuth.js";
import { authenticateToken } from "../middleware/auth.js";


const userRouter = express.Router();

// User Registration
userRouter.post("/register", registerUser);

// User Login
userRouter.post("/login", loginUser);

// Protected routes
userRouter.get('/profile', authenticateToken, getUserProfile);
userRouter.put('/profile', authenticateToken, updateUserProfile);
userRouter.put('/change-password', authenticateToken, changePassword);
userRouter.delete('/delete', authenticateToken, deleteUserProfile);


export default userRouter;
