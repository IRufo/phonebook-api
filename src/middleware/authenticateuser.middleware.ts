

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../config/db";
import { RowDataPacket } from "mysql2/promise";

dotenv.config();

interface AuthRequest extends Request {
    user?: { id: number; role: string };
}

// Verify JWT Token and check user existence
export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };

        // Check if user exists in the database
        const [users] = await pool.query<RowDataPacket[]>(
            "SELECT id, role, is_active FROM users WHERE id = ?",
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: "Unauthorized: User does not exist" });
        }

        const user = users[0];

        // Optional: Check if user is active
        if (user.is_active === 0) {
            return res.status(403).json({ message: "Unauthorized: User is inactive" });
        }

        // Attach user details to the request object
        req.user = { id: user.id, role: user.role };
        next();
    } catch (error) {
        return res.status(403).json({ message: "Unauthorized: Invalid token" });
    }

    
};


// Role-Based Access Control (RBAC)
export const authorizeRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: No user found" });
        }

        if (!req.user.role) {
            return res.status(403).json({ message: "Forbidden: User role missing" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Forbidden: Requires one of the following roles: ${roles.join(", ")}` });
        }

        next();
    };
};

