

import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

interface AuthRequest extends Request {
    user?: { id: number; role: string };
}



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

