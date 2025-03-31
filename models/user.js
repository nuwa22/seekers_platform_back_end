import connection from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

class User {
    constructor(email, userName = "", password = "", name = "", currentPossition = "", industry = "", role = 'user', point = 0, profilePicture = null) {
        this.email = email;
        this.userName = userName;
        this.passwordHash = password ? bcrypt.hashSync(password, 10) : "";
        this.name = name;
        this.currentPossition = currentPossition;
        this.industry = industry;
        this.role = role;
        this.point = point || 0;
        this.profilePicture = profilePicture;
        this.validated = false;
    }

    async save() {
        return new Promise((resolve, reject) => {
            connection.query(
                `INSERT INTO users (email, userName, password_hash, name, currentPossition, industry, role, point, profilePicture) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [this.email, this.userName, this.passwordHash, this.name, this.currentPossition, this.industry, this.role, this.point, this.profilePicture],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    async login(password) {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM users WHERE email = ?',
                [this.email],
                async (err, result) => {
                    if (err) {
                        console.error("Error during database query");
                        reject(err);
                    } else {
                        if (result.length > 0) {
                            // Ensure password and hash are both available before comparing
                            if (!password || !result[0].password_hash) {
                                reject('Authentication failed');
                                return;
                            }

                            try {
                                const isPasswordValid = await bcrypt.compare(password, result[0].password_hash);
                                
                                if (!isPasswordValid) {
                                    reject('Authentication failed');
                                    return;
                                }

                                this.validated = true;
                                const token = jwt.sign(
                                    { userEmail: this.email, userId: result[0].id, role: result[0].role },
                                    process.env.JWT_SECRET,
                                    { expiresIn: '1h' }
                                );

                                // Return only the specified format
                                resolve({
                                    status: "success",
                                    message: "Login successful",
                                    token: token
                                });
                            } catch (bcryptError) {
                                console.error("Error during password verification");
                                reject('Authentication failed');
                            }
                        } else {
                            reject('Authentication failed');
                        }
                    }
                }
            );
        });
    }

    async loadFromEmail() {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT id, email, userName, name, currentPossition, industry, role, point, profilePicture, created_at, updated_at FROM users WHERE email = ?',
                [this.email],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (result.length > 0) {
                            const userData = { ...result[0] };
                            this.validated = true;
                            resolve(userData);
                        } else {
                            reject('User not found');
                        }
                    }
                }
            );
        });
    }

    async updateProfile(updatedData) {
        return new Promise((resolve, reject) => {
            const allowedFields = ['userName', 'name', 'currentPossition', 'industry', 'profilePicture'];
            const updateFields = [];
            const updateValues = [];

            // Build the update query based on which fields are provided
            Object.keys(updatedData).forEach(field => {
                if (allowedFields.includes(field) && updatedData[field] !== undefined) {
                    updateFields.push(`${field} = ?`);
                    updateValues.push(updatedData[field]);
                }
            });

            if (updateFields.length === 0) {
                reject('No valid fields to update');
                return;
            }

            // Add email for the WHERE clause
            updateValues.push(this.email);

            const query = `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE email = ?`;

            connection.query(query, updateValues, (err, result) => {
                if (err) {
                    reject(err);
                } else if (result.affectedRows === 0) {
                    reject('User not found');
                } else {
                    resolve({
                        status: "success",
                        message: "Profile updated successfully"
                    });
                }
            });
        });
    }

    async changePassword(currentPassword, newPassword) {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT password_hash FROM users WHERE email = ?',
                [this.email],
                async (err, result) => {
                    if (err) {
                        reject(err);
                    } else if (result.length === 0) {
                        reject('User not found');
                    } else {
                        try {
                            const isPasswordValid = await bcrypt.compare(currentPassword, result[0].password_hash);
                            
                            if (!isPasswordValid) {
                                reject('Current password is incorrect');
                                return;
                            }

                            const newPasswordHash = bcrypt.hashSync(newPassword, 10);
                            
                            connection.query(
                                'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?',
                                [newPasswordHash, this.email],
                                (updateErr, updateResult) => {
                                    if (updateErr) {
                                        reject(updateErr);
                                    } else {
                                        resolve({
                                            status: "success",
                                            message: "Password changed successfully"
                                        });
                                    }
                                }
                            );
                        } catch (bcryptError) {
                            reject('Error verifying password');
                        }
                    }
                }
            );
        });
    }

    async deleteProfile(password) {
        return new Promise((resolve, reject) => {
            // First, check if the password is correct
            connection.query(
                'SELECT password_hash FROM users WHERE email = ?',
                [this.email],
                async (err, result) => {
                    if (err) {
                        reject(err);
                    } else if (result.length === 0) {
                        reject('User not found');
                    } else {
                        try {
                            const isPasswordValid = await bcrypt.compare(password, result[0].password_hash);
                            
                            if (!isPasswordValid) {
                                reject('Current password is incorrect');
                                return;
                            }

                            // If the password is correct, delete the user's profile
                            connection.query(
                                'DELETE FROM users WHERE email = ?',
                                [this.email],
                                (deleteErr, deleteResult) => {
                                    if (deleteErr) {
                                        reject(deleteErr);
                                    } else if (deleteResult.affectedRows === 0) {
                                        reject('User not found');
                                    } else {
                                        resolve({
                                            status: "success",
                                            message: "Profile deleted successfully"
                                        });
                                    }
                                }
                            );
                        } catch (bcryptError) {
                            reject('Error verifying password');
                        }
                    }
                }
            );
        });
    }
}


// Add this method to your existing User class in models/user.js



export default User;