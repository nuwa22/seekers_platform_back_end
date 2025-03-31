import User from "../models/user.js";

export const registerUser = async (req, res) => {
    try {
        const { email, userName, password, name, currentPossition, industry, profilePicture } = req.body;
        
        // Basic validation
        if (!email || !userName || !password) {
            return res.status(400).json({ error: "Email, username and password are required" });
        }

        // Email format validation
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        
        const newUser = new User(email, userName, password, name, currentPossition, industry, "user", 0, profilePicture);
        await newUser.save();
        
        res.status(201).json({ 
            status: "success",
            message: "User registered successfully" 
        });
    } catch (error) {
        // Handle duplicate email error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "Email or username already exists" });
        }
        
        res.status(500).json({ error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        
        const user = new User(email);
        const result = await user.login(password);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ 
            status: "error",
            error: "Invalid credentials" 
        });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        // The user's email comes from the JWT token via auth middleware
        const { userEmail } = req.user;
        
        const user = new User(userEmail);
        const userData = await user.loadFromEmail();
        
        res.status(200).json({
            status: "success",
            user: userData
        });
    } catch (error) {
        res.status(404).json({ 
            status: "error",
            error: error.message 
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { userEmail } = req.user;
        const { userName, name, currentPossition, industry, profilePicture } = req.body;
        
        const user = new User(userEmail);
        const result = await user.updateProfile({ 
            userName, 
            name, 
            currentPossition, 
            industry, 
            profilePicture 
        });
        
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ 
            status: "error",
            error: error.message 
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { userEmail } = req.user;
        const { currentPassword, newPassword } = req.body;
        
        // Basic validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Current password and new password are required" });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({ error: "New password must be at least 8 characters" });
        }
        
        const user = new User(userEmail);
        const result = await user.changePassword(currentPassword, newPassword);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ 
            status: "error",
            error: error.message 
        });
    }
};

// Inside controllers/userController.js

export const deleteUserProfile = async (req, res) => {
    try {
        const { userEmail } = req.user; // The user's email comes from the JWT token
        const { password } = req.body; // User provides their password for verification
        
        // Basic validation
        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }

        const user = new User(userEmail);
        const result = await user.deleteProfile(password);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            status: "error",
            error: error.message
        });
    }
};
