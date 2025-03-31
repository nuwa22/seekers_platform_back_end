import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(403).json({ error: "Access denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (verified.user.role !== "admin") return res.status(403).json({ error: "Unauthorized" });
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};

export default adminAuth;
