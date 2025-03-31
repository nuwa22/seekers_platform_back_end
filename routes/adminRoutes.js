import express from "express";
import { loginAdmin } from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";

const adminRouter = express.Router();

// Admin Login
adminRouter.post("/login", loginAdmin);

// Protected Route - Example Admin Dashboard
adminRouter.get("/dashboard", adminAuth, (req, res) => {
    res.json({ message: "Admin Dashboard", admin: req.user });
});

export default adminRouter;
