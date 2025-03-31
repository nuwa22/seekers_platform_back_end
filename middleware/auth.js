import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (!token) {
        return res.status(401).json({ 
            status: "error",
            error: 'Access denied. No token provided.' 
        });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user data to request
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(403).json({ 
            status: "error",
            error: 'Invalid or expired token.' 
        });
    }
};

export const authorizeRole = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                status: "error",
                error: 'Access denied. Insufficient privileges.' 
            });
        }
        next();
    };
};