import Admin from "../models/admin.js";
import connection from "../db/db.js";

export const loginAdmin = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        
        if (!emailOrUsername || !password) {
            return res.status(400).json({
                status: "error",
                message: "Email/username and password are required"
            });
        }
        
        // Create an admin instance
        const admin = new Admin(emailOrUsername);
        
        // Attempt to login with email or username
        const result = await admin.loginWithEmailOrUsername(emailOrUsername, password);
        
        res.status(200).json(result);
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(401).json({
            status: "error",
            message: typeof error === 'string' ? error : (error.message || "Authentication failed")
        });
    }
};