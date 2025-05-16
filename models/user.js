import connection from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

class User {
    constructor(email, password = "", name = "", currentPossition = "", industry = "", role = 'user', point = 0, profilePicture = "") {
        this.email = email;
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
                `INSERT INTO users (email, password_hash, name, currentPossition, industry, role, point, profilePicture)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [this.email, this.passwordHash, this.name, this.currentPossition, this.industry, this.role, this.point, this.profilePicture],
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
                    } else if (result.length > 0) {
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

                            const userPayload = {
                                id: result[0].id,
                                email: result[0].email,
                                name: result[0].name,
                                currentPossition: result[0].currentPossition,
                                industry: result[0].industry,
                                role: result[0].role,
                                point: result[0].point,
                                profilePicture: result[0].profilePicture,
                                createdAt: result[0].created_at,
                                updatedAt: result[0].updated_at
                            };

                            const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

                            resolve({
                                status: "success",
                                message: "Login successful",
                                token: token,
                                user: userPayload
                            });
                        } catch (bcryptError) {
                            console.error("Error during password verification");
                            reject('Authentication failed');
                        }
                    } else {
                        reject('Authentication failed');
                    }
                }
            );
        });
    }

    async loadFromEmail() {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT id, email, name, currentPossition, industry, role, point, profilePicture, created_at, updated_at FROM users WHERE email = ?',
                [this.email],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else if (result.length > 0) {
                        const userData = { ...result[0] };
                        this.validated = true;
                        resolve(userData);
                    } else {
                        reject('User not found');
                    }
                }
            );
        });
    }

    async updateProfile(updatedData) {
        return new Promise((resolve, reject) => {
            const allowedFields = ['name', 'currentPossition', 'industry', 'profilePicture'];
            const updateFields = [];
            const updateValues = [];

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

export default User;
