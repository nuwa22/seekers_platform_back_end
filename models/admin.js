import User from "./user.js";
import connection from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

class Admin extends User {
    constructor(email, password = "", name = "", currentPossition = "", industry = "", role = "admin", point = 0, profilePicture = null) {
        super(email, "", password, name, currentPossition, industry, role, point, profilePicture);
        this.role = "admin";
    }

    async loginWithEmail(email, password) {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM users WHERE email = ? AND role = "admin"',
                [email],
                async (err, result) => {
                    if (err) {
                        console.error("Error during database query");
                        reject(err);
                    } else {
                        if (result.length > 0) {
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
                                    {
                                        userEmail: result[0].email,
                                        userId: result[0].id,
                                        role: result[0].role
                                    },
                                    process.env.JWT_SECRET,
                                    { expiresIn: '1h' }
                                );

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
}

export default Admin;
