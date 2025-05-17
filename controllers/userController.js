import User from "../models/user.js";
import connection from "../db/db.js";

export const registerUser = async (req, res) => {
    try {
        const { email, password, name, currentPossition, industry, profilePicture } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const newUser = new User(email, password, name, currentPossition, industry, "user", 0, profilePicture);
        await newUser.save();

        res.status(201).json({
            status: "success",
            message: "User registered successfully"
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "Email already exists" });
        }
        console.error("Register error:", error);
        res.status(500).json({ status: "error", error: error.message || "Server error" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = new User(email);
        const result = await user.login(password);

        res.status(200).json(result);
    } catch (error) {
        console.error("Login error:", error);
        res.status(401).json({
            status: "error",
            error: "Invalid credentials"
        });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const { email } = req.user;

        const user = new User(email);
        const userData = await user.loadFromEmail();

        res.status(200).json({
            status: "success",
            user: userData
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(404).json({
            status: "error",
            error: error.message || "User not found"
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { email } = req.user;
        const { name, currentPossition, industry, profilePicture } = req.body;

        const user = new User(email);
        const result = await user.updateProfile({
            name,
            currentPossition,
            industry,
            profilePicture
        });

        // After successful user profile update, update all forms owned by this user
        if (name || profilePicture) {
    try {
        // Build the update query for the 'forms' table
        let formsUpdateQuery = "UPDATE forms SET ";
        const formsUpdateFields = [];
        const formsUpdateValues = [];

        if (name) {
            formsUpdateFields.push("owner_name = ?");
            formsUpdateValues.push(name);
        }

        if (profilePicture) {
            formsUpdateFields.push("owner_profile_picture = ?");
            formsUpdateValues.push(profilePicture);
        }

        formsUpdateQuery += formsUpdateFields.join(", ") + " WHERE owner_email = ?";
        formsUpdateValues.push(email);

        await connection.promise().query(formsUpdateQuery, formsUpdateValues);
        console.log(`Updated 'forms' table for user ${email}`);

        // Build the update query for the 'io_documents' table
        let ioDocsUpdateQuery = "UPDATE io_documents SET ";
        const ioDocsUpdateFields = [];
        const ioDocsUpdateValues = [];

        if (name) {
            ioDocsUpdateFields.push("owner_name = ?");
            ioDocsUpdateValues.push(name);
        }

        if (profilePicture) {
            ioDocsUpdateFields.push("io_owner_profile_picture = ?");
            ioDocsUpdateValues.push(profilePicture);
        }

        ioDocsUpdateQuery += ioDocsUpdateFields.join(", ") + " WHERE owner_email = ?";
        ioDocsUpdateValues.push(email);

        await connection.promise().query(ioDocsUpdateQuery, ioDocsUpdateValues);
        console.log(`Updated 'io_documents' table for user ${email}`);

    } catch (error) {
        console.error("Error updating user data in forms or io_documents:", error);
        // Log and continue – don’t stop the process even if one update fails
    }
}


        res.status(200).json(result);
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(400).json({
            status: "error",
            error: error.message || "Failed to update profile"
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { email } = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Current password and new password are required" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: "New password must be at least 8 characters" });
        }

        const user = new User(email);
        const result = await user.changePassword(currentPassword, newPassword);

        res.status(200).json(result);
    } catch (error) {
        console.error("Change password error:", error);
        res.status(400).json({
            status: "error",
            error: error.message || "Failed to change password"
        });
    }
};

export const deleteUserProfile = async (req, res) => {
    try {
        const { email } = req.user;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }

        const user = new User(email);
        const result = await user.deleteProfile(password);

        res.status(200).json(result);
    } catch (error) {
        console.error("Delete profile error:", error);
        res.status(400).json({
            status: "error",
            error: error.message || "Failed to delete profile"
        });
    }
};