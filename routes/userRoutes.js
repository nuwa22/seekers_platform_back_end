import express from "express";
import { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword, deleteUserProfile,  } from "../controllers/userController.js";
import userAuth from "../middleware/userAuth.js";
import { authenticateToken } from "../middleware/auth.js";


const userRouter = express.Router();


userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get('/profile', authenticateToken, getUserProfile);
userRouter.put('/profile', authenticateToken, updateUserProfile);
userRouter.put('/change-password', authenticateToken, changePassword);
userRouter.delete('/delete', authenticateToken, deleteUserProfile);


export default userRouter;
