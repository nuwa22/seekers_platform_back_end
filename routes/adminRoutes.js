import express from "express";
import {getAllUsers, getAllForms } from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";


const adminRouter = express.Router();
adminRouter.use(authenticateToken, authorizeRole("admin"));



adminRouter.get("/users", getAllUsers);                            
adminRouter.get("/forms", getAllForms);

adminRouter.get("/dashboard", adminAuth, (req, res) => {
    res.json({ message: "Admin Dashboard", admin: req.user });
});

export default adminRouter;
