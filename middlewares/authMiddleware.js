// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Middleware to protect routes - verifies Access Token
 */
export const protect = async (req, res, next) => {
    try {
        // Expect Authorization: Bearer <token>
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorized, token missing" });
        }

        const token = authHeader.split(" ")[1];

        // Verify access token using ACCESS secret
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        if (!decoded?.id) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        // Attach user (minus password + refreshToken)
        const user = await User.findById(decoded.id).select("-password -refreshToken");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("JWT verification error:", err.message);
        return res.status(403).json({ message: "Access token expired or invalid" });
    }
};

/**
 * Middleware for Admin-only access
 */
export const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Admin access only" });
    }
    next();
};
